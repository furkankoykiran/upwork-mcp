/**
 * Token bucket rate limiter for Upwork API requests
 * Prevents exceeding rate limits and implements backoff
 */

import { RateLimitError } from './errors.js';

export interface RateLimitConfig {
  perSecond: number;
  perMinute: number;
  perDay: number;
}

export interface RateLimitStats {
  remaining: number;
  resetTime: Date;
}

/**
 * Token bucket rate limiter implementation
 */
export class RateLimiter {
  private secondTokens: number;
  private minuteTokens: number;
  private dayTokens: number;

  private lastSecondTime: number;
  private lastMinuteTime: number;
  private lastDayTime: number;

  private readonly perSecond: number;
  private readonly perMinute: number;
  private readonly perDay: number;

  constructor(config: RateLimitConfig) {
    this.perSecond = config.perSecond;
    this.perMinute = config.perMinute;
    this.perDay = config.perDay;

    // Initialize with full buckets
    this.secondTokens = this.perSecond;
    this.minuteTokens = this.perMinute;
    this.dayTokens = this.perDay;

    const now = Date.now();
    this.lastSecondTime = now;
    this.lastMinuteTime = now;
    this.lastDayTime = now;
  }

  /**
   * Wait for available tokens
   * Throws RateLimitError if all buckets are empty
   */
  async acquireToken(): Promise<void> {
    const now = Date.now();

    // Refill buckets based on time elapsed
    this.refillBuckets(now);

    // Check if we have tokens available
    if (this.secondTokens > 0 && this.minuteTokens > 0 && this.dayTokens > 0) {
      // Consume one token from each bucket
      this.secondTokens--;
      this.minuteTokens--;
      this.dayTokens--;
      return;
    }

    // Calculate wait time until next token is available
    const waitTime = this.calculateWaitTime(now);

    if (waitTime > 0) {
      throw new RateLimitError('Rate limit exceeded', Math.ceil(waitTime / 1000), {
        secondTokens: this.secondTokens,
        minuteTokens: this.minuteTokens,
        dayTokens: this.dayTokens,
        waitTime: Math.ceil(waitTime / 1000),
      });
    }
  }

  /**
   * Refill tokens based on elapsed time
   */
  private refillBuckets(now: number): void {
    const secondElapsed = now - this.lastSecondTime;
    const minuteElapsed = now - this.lastMinuteTime;
    const dayElapsed = now - this.lastDayTime;

    // Refill second bucket
    if (secondElapsed >= 1000) {
      const secondsPassed = Math.floor(secondElapsed / 1000);
      this.secondTokens = Math.min(this.perSecond, this.secondTokens + secondsPassed);
      this.lastSecondTime = now;
    }

    // Refill minute bucket
    if (minuteElapsed >= 60000) {
      const minutesPassed = Math.floor(minuteElapsed / 60000);
      this.minuteTokens = Math.min(this.perMinute, this.minuteTokens + minutesPassed);
      this.lastMinuteTime = now;
    }

    // Refill day bucket
    if (dayElapsed >= 86400000) {
      const daysPassed = Math.floor(dayElapsed / 86400000);
      this.dayTokens = Math.min(this.perDay, this.dayTokens + daysPassed * this.perDay);
      this.lastDayTime = now;
    }
  }

  /**
   * Calculate wait time until next token is available
   */
  private calculateWaitTime(now: number): number {
    const waitTimes: number[] = [];

    if (this.secondTokens <= 0) {
      waitTimes.push(1000 - (now - this.lastSecondTime));
    }

    if (this.minuteTokens <= 0) {
      waitTimes.push(60000 - (now - this.lastMinuteTime));
    }

    if (this.dayTokens <= 0) {
      waitTimes.push(86400000 - (now - this.lastDayTime));
    }

    return waitTimes.length > 0 ? Math.max(...waitTimes) : 0;
  }

  /**
   * Get current rate limit statistics
   */
  getStats(): RateLimitStats {
    const now = Date.now();
    this.refillBuckets(now);

    return {
      remaining: Math.min(this.secondTokens, this.minuteTokens, this.dayTokens),
      resetTime: new Date(
        Math.max(
          this.lastSecondTime + 1000,
          this.lastMinuteTime + 60000,
          this.lastDayTime + 86400000
        )
      ),
    };
  }

  /**
   * Reset all buckets (for testing)
   */
  reset(): void {
    this.secondTokens = this.perSecond;
    this.minuteTokens = this.perMinute;
    this.dayTokens = this.perDay;

    const now = Date.now();
    this.lastSecondTime = now;
    this.lastMinuteTime = now;
    this.lastDayTime = now;
  }
}

/**
 * Create default rate limiter from environment variables
 */
export function createDefaultRateLimiter(): RateLimiter {
  return new RateLimiter({
    perSecond: parseInt(process.env.RATE_LIMIT_PER_SECOND || '10', 10),
    perMinute: parseInt(process.env.RATE_LIMIT_PER_MINUTE || '300', 10),
    perDay: parseInt(process.env.RATE_LIMIT_PER_DAY || '40000', 10),
  });
}
