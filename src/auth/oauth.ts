/**
 * OAuth 2.0 Authorization Code Grant flow for Upwork
 * Handles user authentication and token exchange
 */

import http from "http";
import crypto from "crypto";
import { URL } from "url";
import { TokenStore, TokenData } from "./token-store.js";
import { AuthenticationError } from "../client/errors.js";

export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUrl: string;
  oauthUrl: string;
  tokenUrl: string;
}

export interface AuthorizationResult {
  success: boolean;
  code?: string;
  error?: string;
  state?: string;
}

/**
 * OAuth 2.0 flow manager
 */
export class OAuthManager {
  private config: OAuthConfig;
  private tokenStore: TokenStore;

  constructor(_config?: Partial<OAuthConfig>) {
    this.config = {
      clientId: process.env.UPWORK_CLIENT_ID || "",
      clientSecret: process.env.UPWORK_CLIENT_SECRET || "",
      redirectUrl: process.env.UPWORK_REDIRECT_URL || "http://localhost:3000/callback",
      oauthUrl: process.env.UPWORK_OAUTH_URL || "https://www.upwork.com/ab/account-security/oauth2/authorize",
      tokenUrl: process.env.UPWORK_TOKEN_URL || "https://www.upwork.com/api/v3/oauth2/token",
    };

    this.tokenStore = new TokenStore();

    this.validateConfig();
  }

  /**
   * Validate OAuth configuration
   */
  private validateConfig(): void {
    if (!this.config.clientId || !this.config.clientSecret) {
      throw new AuthenticationError(
        "Missing OAuth credentials. Please set UPWORK_CLIENT_ID and UPWORK_CLIENT_SECRET environment variables."
      );
    }
  }

  /**
   * Generate authorization URL
   */
  generateAuthUrl(state?: string): string {
    const authState = state || this.generateState();

    const params = new URLSearchParams({
      response_type: "code",
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUrl,
      state: authState,
    });

    return `${this.config.oauthUrl}?${params.toString()}`;
  }

  /**
   * Generate random state parameter for CSRF protection
   */
  private generateState(): string {
    return crypto.randomBytes(16).toString("hex");
  }

  /**
   * Start local HTTP server for OAuth callback
   */
  async startCallbackServer(): Promise<AuthorizationResult> {
    return new Promise((resolve, reject) => {
      const state = this.generateState();
      const authUrl = this.generateAuthUrl(state);

      console.error("\n=== Upwork OAuth Authentication ===");
      console.error("\n1. Open the following URL in your browser:");
      console.error(`\n${authUrl}\n`);
      console.error("2. Log in to Upwork and authorize the application");
      console.error("3. You will be redirected back to this application\n");

      // Open browser (optional - depends on environment)
      this.openBrowser(authUrl).catch(() => {
        // Ignore errors if browser can't be opened
      });

      const server = http.createServer(async (req, res) => {
        const url = new URL(req.url || "", `http://${req.headers.host}`);

        if (url.pathname === "/callback") {
          const code = url.searchParams.get("code");
          const error = url.searchParams.get("error");
          const returnedState = url.searchParams.get("state");

          // Send response
          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(`
            <!DOCTYPE html>
            <html>
            <head>
              <title>Authentication Complete</title>
              <style>
                body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  height: 100vh;
                  margin: 0;
                  background: #f5f5f5;
                }
                .container {
                  text-align: center;
                  padding: 40px;
                  background: white;
                  border-radius: 8px;
                  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }
                h1 { color: #333; }
                p { color: #666; }
                .success { color: #28a745; }
                .error { color: #dc3545; }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>${error ? "Authentication Failed" : "Authentication Successful"}</h1>
                <p class="${error ? "error" : "success"}">
                  ${error || "You can close this window and return to the terminal."}
                </p>
              </div>
            </body>
            </html>
          `);

          // Verify state
          if (returnedState !== state) {
            server.close();
            reject(new AuthenticationError("Invalid state parameter. Possible CSRF attack."));
            return;
          }

          // Resolve promise
          server.close();
          resolve({
            success: !error,
            code: code || undefined,
            error: error || undefined,
            state: returnedState || undefined,
          });
        }
      });

      server.listen(3000, () => {
        console.error("Callback server listening on http://localhost:3000");
        console.error("Waiting for authentication...\n");
      });

      // Timeout after 5 minutes
      setTimeout(() => {
        server.close();
        reject(new AuthenticationError("Authentication timed out. Please try again."));
      }, 5 * 60 * 1000);
    });
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string): Promise<TokenData> {
    try {
      const params = new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        redirect_uri: this.config.redirectUrl,
      });

      const response = await fetch(this.config.tokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new AuthenticationError(
          `Token exchange failed: ${response.status} ${response.statusText}\n${errorText}`
        );
      }

      const data = await response.json();

      const tokenData: TokenData = {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        tokenType: data.token_type || "Bearer",
        expiresIn: data.expires_in || 86400, // Default 24 hours
        expiresAt: 0, // Will be set by saveToken
        acquiredAt: 0, // Will be set by saveToken
      };

      // Save token
      await this.tokenStore.saveToken(tokenData);

      return tokenData;
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      throw new AuthenticationError(
        `Failed to exchange code for token: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(): Promise<TokenData> {
    const refreshToken = await this.tokenStore.getRefreshToken();

    if (!refreshToken) {
      throw new AuthenticationError("No refresh token available. Please re-authenticate.");
    }

    try {
      const params = new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
      });

      const response = await fetch(this.config.tokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new AuthenticationError(
          `Token refresh failed: ${response.status} ${response.statusText}\n${errorText}`
        );
      }

      const data = await response.json();

      const tokenData: TokenData = {
        accessToken: data.access_token,
        refreshToken: data.refresh_token || refreshToken, // Use old refresh token if new one not provided
        tokenType: data.token_type || "Bearer",
        expiresIn: data.expires_in || 86400,
        expiresAt: 0,
        acquiredAt: 0,
      };

      // Save token
      await this.tokenStore.saveToken(tokenData);

      return tokenData;
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      throw new AuthenticationError(
        `Failed to refresh token: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Get current access token (with auto-refresh)
   */
  async getAccessToken(): Promise<string> {
    try {
      return await this.tokenStore.getAccessToken();
    } catch (error) {
      // Try to refresh token if expired
      if (error instanceof Error && error.message.includes("expired")) {
        console.error("Access token expired. Refreshing...");
        await this.refreshToken();
        return await this.tokenStore.getAccessToken();
      }
      throw error;
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    return await this.tokenStore.isTokenValid();
  }

  /**
   * Clear authentication
   */
  async logout(): Promise<void> {
    await this.tokenStore.clearToken();
    console.error("Logged out successfully.");
  }

  /**
   * Get token info
   */
  async getTokenInfo(): Promise<{
    exists: boolean;
    expiresAt?: number;
    isExpired?: boolean;
    hasRefreshToken?: boolean;
  } | null> {
    return await this.tokenStore.getTokenInfo();
  }

  /**
   * Open browser with authorization URL
   */
  private async openBrowser(url: string): Promise<void> {
    const { exec } = await import("child_process");

    return new Promise((resolve, reject) => {
      const command = process.platform === "win32" ? "start" : process.platform === "darwin" ? "open" : "xdg-open";

      exec(`${command} "${url}"`, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Run full authentication flow
   */
  async authenticate(): Promise<TokenData> {
    // Start callback server and wait for authorization
    const result = await this.startCallbackServer();

    if (!result.success || !result.code) {
      throw new AuthenticationError(
        result.error || "Authentication failed"
      );
    }

    // Exchange code for token
    return await this.exchangeCodeForToken(result.code);
  }
}

/**
 * Create OAuth manager from environment variables
 */
export function createOAuthManager(): OAuthManager {
  return new OAuthManager();
}
