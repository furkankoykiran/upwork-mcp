/**
 * Token storage and management for Upwork OAuth 2.0
 * Handles persistent storage, token refresh, and validation
 */

import fs from "fs/promises";
import path from "path";
import { existsSync } from "fs";
import { TokenExpiredError, AuthenticationError } from "../client/errors.js";

export interface TokenData {
  accessToken: string;
  refreshToken?: string;
  tokenType: string;
  expiresIn: number;
  expiresAt: number;
  acquiredAt: number;
}

export interface TokenStorageConfig {
  storageDir: string;
  tokenFile: string;
}

const DEFAULT_STORAGE_DIR = path.join(process.env.HOME || "", ".upwork-mcp");
const DEFAULT_TOKEN_FILE = "token.json";

/**
 * Token storage manager
 */
export class TokenStore {
  private config: TokenStorageConfig;
  private tokenData: TokenData | null = null;

  constructor(config?: Partial<TokenStorageConfig>) {
    this.config = {
      storageDir: config?.storageDir || DEFAULT_STORAGE_DIR,
      tokenFile: config?.tokenFile || DEFAULT_TOKEN_FILE,
    };
  }

  /**
   * Get token file path
   */
  private getTokenFilePath(): string {
    return path.join(this.config.storageDir, this.config.tokenFile);
  }

  /**
   * Ensure storage directory exists
   */
  private async ensureStorageDir(): Promise<void> {
    try {
      await fs.mkdir(this.config.storageDir, { mode: 0o700, recursive: true });
    } catch (error) {
      throw new AuthenticationError(
        `Failed to create storage directory: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Save token data to file
   */
  async saveToken(tokenData: TokenData): Promise<void> {
    await this.ensureStorageDir();

    // Calculate expiration time
    const expiresAt = Date.now() + tokenData.expiresIn * 1000;
    const tokenWithExpiry: TokenData = {
      ...tokenData,
      expiresAt,
      acquiredAt: Date.now(),
    };

    this.tokenData = tokenWithExpiry;

    try {
      const tokenPath = this.getTokenFilePath();
      await fs.writeFile(tokenPath, JSON.stringify(tokenWithExpiry, null, 2), {
        mode: 0o600,
      });
    } catch (error) {
      throw new AuthenticationError(
        `Failed to save token: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Load token data from file
   */
  async loadToken(): Promise<TokenData | null> {
    if (this.tokenData) {
      return this.tokenData;
    }

    const tokenPath = this.getTokenFilePath();

    if (!existsSync(tokenPath)) {
      return null;
    }

    try {
      const content = await fs.readFile(tokenPath, "utf-8");
      this.tokenData = JSON.parse(content) as TokenData;
      return this.tokenData;
    } catch (error) {
      throw new AuthenticationError(
        `Failed to load token: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Get current access token
   * Throws if token is expired or missing
   */
  async getAccessToken(): Promise<string> {
    const tokenData = await this.loadToken();

    if (!tokenData) {
      throw new AuthenticationError("No token found. Please authenticate first.");
    }

    if (this.isTokenExpired(tokenData)) {
      throw new TokenExpiredError({
        expiresAt: tokenData.expiresAt,
      });
    }

    return tokenData.accessToken;
  }

  /**
   * Get refresh token
   */
  async getRefreshToken(): Promise<string | null> {
    const tokenData = await this.loadToken();

    if (!tokenData || !tokenData.refreshToken) {
      return null;
    }

    return tokenData.refreshToken;
  }

  /**
   * Check if token is expired
   */
  private isTokenExpired(tokenData: TokenData): boolean {
    // Add 5 minute buffer before expiration
    const buffer = 5 * 60 * 1000;
    return Date.now() >= tokenData.expiresAt - buffer;
  }

  /**
   * Check if token exists and is valid
   */
  async isTokenValid(): Promise<boolean> {
    try {
      const tokenData = await this.loadToken();
      return tokenData !== null && !this.isTokenExpired(tokenData);
    } catch {
      return false;
    }
  }

  /**
   * Clear stored token
   */
  async clearToken(): Promise<void> {
    this.tokenData = null;

    const tokenPath = this.getTokenFilePath();

    if (existsSync(tokenPath)) {
      try {
        await fs.unlink(tokenPath);
      } catch (error) {
        throw new AuthenticationError(
          `Failed to clear token: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }
  }

  /**
   * Get token info (for debugging)
   */
  async getTokenInfo(): Promise<{
    exists: boolean;
    expiresAt?: number;
    isExpired?: boolean;
    hasRefreshToken?: boolean;
  } | null> {
    const tokenData = await this.loadToken();

    if (!tokenData) {
      return { exists: false };
    }

    return {
      exists: true,
      expiresAt: tokenData.expiresAt,
      isExpired: this.isTokenExpired(tokenData),
      hasRefreshToken: !!tokenData.refreshToken,
    };
  }
}

/**
 * Create default token store
 */
export function createTokenStore(): TokenStore {
  return new TokenStore();
}
