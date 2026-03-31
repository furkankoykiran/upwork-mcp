/**
 * GraphQL client for Upwork API
 * Handles authentication, rate limiting, and error handling
 */

import { GraphQLClient, ClientError as GraphQLClientError } from 'graphql-request';
import {
  UpworkMCPError,
  APIError,
  GraphQLError,
  TokenExpiredError,
  NetworkError,
  RateLimitError,
} from './errors.js';
import { RateLimiter, createDefaultRateLimiter } from './rate-limiter.js';

export interface UpworkAuthConfig {
  accessToken: string;
  refreshToken?: string;
  tokenType?: string;
  expiresIn?: number;
}

export interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string; path?: string[]; extensions?: Record<string, unknown> }>;
}

export class UpworkGraphQLClient {
  private client: GraphQLClient;
  private rateLimiter: RateLimiter;
  private authConfig: UpworkAuthConfig;
  private apiUrl: string;

  constructor(
    authConfig: UpworkAuthConfig,
    apiUrl: string = process.env.UPWORK_API_URL || 'https://api.upwork.com/graphql'
  ) {
    this.authConfig = authConfig;
    this.apiUrl = apiUrl;
    this.rateLimiter = createDefaultRateLimiter();

    this.client = new GraphQLClient(apiUrl, {
      headers: {
        Authorization: `Bearer ${authConfig.accessToken}`,
      },
    });
  }

  /**
   * Execute GraphQL query with rate limiting and error handling
   */
  async query<T>(
    query: string,
    variables?: Record<string, unknown>,
    options?: {
      retries?: number;
      timeout?: number;
    }
  ): Promise<T> {
    const retries = options?.retries ?? 3;
    const timeout = options?.timeout ?? 30000;

    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        // Acquire rate limit token
        await this.rateLimiter.acquireToken();

        // Execute query with timeout
        const result = await this.executeWithTimeout<T>(query, variables, timeout);

        return result;
      } catch (error) {
        lastError = error as Error;

        // Don't retry on certain errors
        if (error instanceof UpworkMCPError && !error.retryable) {
          throw error;
        }

        // Wait before retry (exponential backoff)
        if (attempt < retries) {
          const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
          await this.sleep(delay);
        }
      }
    }

    throw lastError || new APIError('Max retries exceeded');
  }

  /**
   * Execute GraphQL mutation
   */
  async mutate<T>(
    mutation: string,
    variables?: Record<string, unknown>,
    options?: {
      retries?: number;
      timeout?: number;
    }
  ): Promise<T> {
    return this.query<T>(mutation, variables, options);
  }

  /**
   * Update authentication credentials
   */
  updateAuth(authConfig: Partial<UpworkAuthConfig>): void {
    this.authConfig = {
      ...this.authConfig,
      ...authConfig,
    };

    this.client = new GraphQLClient(this.apiUrl, {
      headers: {
        Authorization: `Bearer ${this.authConfig.accessToken}`,
      },
    });
  }

  /**
   * Get current access token
   */
  getAccessToken(): string {
    return this.authConfig.accessToken;
  }

  /**
   * Get refresh token if available
   */
  getRefreshToken(): string | undefined {
    return this.authConfig.refreshToken;
  }

  /**
   * Get the GraphQL endpoint URL
   */
  getEndpointUrl(): string {
    return (this.client as any).url;
  }

  /**
   * Execute query with timeout
   */
  private async executeWithTimeout<T>(
    query: string,
    variables: Record<string, unknown> | undefined,
    _timeout: number
  ): Promise<T> {
    try {
      const response = await this.client.request<GraphQLResponse<T>>(query, variables);

      // Check for GraphQL errors
      if (response.errors && response.errors.length > 0) {
        throw new GraphQLError(
          'GraphQL request returned errors',
          response.errors.map((e) => ({
            message: e.message,
            path: e.path,
          }))
        );
      }

      if (!response.data) {
        throw new APIError('No data returned from GraphQL query');
      }

      return response.data;
    } catch (error) {
      if (error instanceof GraphQLError) {
        throw error;
      }

      if (error instanceof GraphQLClientError) {
        // Handle client errors
        const statusCode = error.response.statusCode;

        if (statusCode === 401) {
          throw new TokenExpiredError({
            statusCode,
            message: error.message,
          });
        }

        if (statusCode === 429) {
          const retryAfter = this.extractRetryAfter(error.response);
          throw new RateLimitError('Rate limit exceeded', retryAfter, {
            statusCode: statusCode as number,
          });
        }

        throw new APIError(error.message, statusCode as number, { response: error.response });
      }

      // Network or other errors
      if (error instanceof Error) {
        if (error.name === 'TypeError' || error.message.includes('ECONNREFUSED')) {
          throw new NetworkError(error.message, { originalError: error.name });
        }
      }

      throw new APIError(`Unknown error: ${error instanceof Error ? error.message : 'Unknown'}`);
    }
  }

  /**
   * Extract Retry-After header from response
   */
  private extractRetryAfter(response: any): number | undefined {
    try {
      const retryAfter = response.headers?.get('Retry-After');
      if (retryAfter) {
        const seconds = parseInt(retryAfter, 10);
        return isNaN(seconds) ? undefined : seconds;
      }
    } catch {
      // Ignore errors extracting header
    }
    return undefined;
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get rate limiter stats
   */
  getRateLimitStats() {
    return this.rateLimiter.getStats();
  }
}

/**
 * Create client from environment variables
 */
export function createClient(authConfig: UpworkAuthConfig): UpworkGraphQLClient {
  return new UpworkGraphQLClient(authConfig);
}
