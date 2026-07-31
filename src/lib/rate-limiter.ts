/**
 * Rate Limiter — Prevents API abuse
 * Client-side rate limiting for API calls, auth attempts, and uploads
 */

class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = 100, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  canMakeRequest(key: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    const validRequests = requests.filter((time) => now - time < this.windowMs);

    if (validRequests.length >= this.maxRequests) {
      return false;
    }

    validRequests.push(now);
    this.requests.set(key, validRequests);
    return true;
  }

  getRemainingRequests(key: string): number {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    const validRequests = requests.filter((time) => now - time < this.windowMs);
    return Math.max(0, this.maxRequests - validRequests.length);
  }

  getResetTime(key: string): number {
    const requests = this.requests.get(key) || [];
    if (requests.length === 0) return 0;
    return requests[0] + this.windowMs;
  }

  reset(key: string): void {
    this.requests.delete(key);
  }
}

// Pre-configured limiters
export const apiLimiter = new RateLimiter(100, 60000); // 100 req/min
export const authLimiter = new RateLimiter(5, 300000); // 5 login attempts per 5 min
export const uploadLimiter = new RateLimiter(10, 60000); // 10 uploads/min
export const searchLimiter = new RateLimiter(30, 60000); // 30 searches/min

export { RateLimiter };