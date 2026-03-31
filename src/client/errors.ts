/**
 * Custom error types for Upwork MCP server
 */

export enum ErrorCode {
  // Authentication errors
  AUTH_REQUIRED = 'AUTH_REQUIRED',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_REFRESH_FAILED = 'TOKEN_REFRESH_FAILED',

  // Rate limiting
  RATE_LIMITED = 'RATE_LIMITED',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',

  // API errors
  API_ERROR = 'API_ERROR',
  GRAPHQL_ERROR = 'GRAPHQL_ERROR',
  INVALID_RESPONSE = 'INVALID_RESPONSE',

  // Network errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',

  // Input validation
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_PARAMETER = 'MISSING_PARAMETER',

  // Resource errors
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',

  // Partial success
  PARTIAL_RESPONSE = 'PARTIAL_RESPONSE',
}

export class UpworkMCPError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public retryable: boolean = false,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'UpworkMCPError';
  }

  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      retryable: this.retryable,
      details: this.details,
    };
  }
}

export class AuthenticationError extends UpworkMCPError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(ErrorCode.AUTH_REQUIRED, message, false, details);
    this.name = 'AuthenticationError';
  }
}

export class TokenExpiredError extends UpworkMCPError {
  constructor(details?: Record<string, unknown>) {
    super(ErrorCode.TOKEN_EXPIRED, 'Access token has expired', true, details);
    this.name = 'TokenExpiredError';
  }
}

export class RateLimitError extends UpworkMCPError {
  constructor(
    message: string = 'Rate limit exceeded',
    public retryAfter?: number,
    details?: Record<string, unknown>
  ) {
    super(ErrorCode.RATE_LIMITED, message, true, {
      ...details,
      retryAfter,
    });
    this.name = 'RateLimitError';
  }
}

export class APIError extends UpworkMCPError {
  constructor(
    message: string,
    public statusCode?: number,
    details?: Record<string, unknown>
  ) {
    super(ErrorCode.API_ERROR, message, (statusCode ?? 0) >= 500, details);
    this.name = 'APIError';
  }
}

export class GraphQLError extends UpworkMCPError {
  constructor(
    message: string,
    public graphqlErrors: Array<{ message: string; path?: string[] }>,
    details?: Record<string, unknown>
  ) {
    super(ErrorCode.GRAPHQL_ERROR, message, false, {
      ...details,
      graphqlErrors,
    });
    this.name = 'GraphQLError';
  }
}

export class NetworkError extends UpworkMCPError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(ErrorCode.NETWORK_ERROR, message, true, details);
    this.name = 'NetworkError';
  }
}

export class ValidationError extends UpworkMCPError {
  constructor(
    message: string,
    public field?: string,
    details?: Record<string, unknown>
  ) {
    super(ErrorCode.INVALID_INPUT, message, false, {
      ...details,
      field,
    });
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends UpworkMCPError {
  constructor(resource: string, identifier: string) {
    super(ErrorCode.NOT_FOUND, `${resource} not found: ${identifier}`, false, {
      resource,
      identifier,
    });
    this.name = 'NotFoundError';
  }
}

/**
 * Format error for MCP response
 */
export function formatMCPError(error: unknown): { content: Array<{ type: 'text'; text: string }> } {
  if (error instanceof UpworkMCPError) {
    const errorText = `Error (${error.code}): ${error.message}${
      error.retryable ? ' (This error can be retried)' : ''
    }`;

    return {
      content: [
        {
          type: 'text' as const,
          text: errorText,
        },
      ],
    };
  }

  // Unknown error
  const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
  return {
    content: [
      {
        type: 'text' as const,
        text: `Error: ${errorMessage}`,
      },
    ],
  };
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof UpworkMCPError) {
    return error.retryable;
  }
  return false;
}

/**
 * Extract retry-after delay from error
 */
export function getRetryAfterDelay(error: unknown): number | null {
  if (error instanceof RateLimitError && error.retryAfter) {
    return error.retryAfter * 1000; // Convert to milliseconds
  }
  return null;
}
