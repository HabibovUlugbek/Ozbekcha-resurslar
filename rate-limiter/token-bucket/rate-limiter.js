class TokenBucket {
  constructor(capacity, refillRate) {
    this.capacity = capacity;
    this.refillRate = refillRate;
    this.tokens = capacity;
    this.lastRefillTimestamp = Date.now();
  }

  consume() {
    this.refill(); // Tokenlarni yangilash

    if (this.tokens >= 1) {
      this.tokens -= 1;
      return true; // So'rov qabul qilinsin
    }
    return false; // So'rov rad etilsin
  }

  refill() {
    const now = Date.now();
    const elapsedTime = (now - this.lastRefillTimestamp) / 1000; // Sekundlarda vaqt
    const tokensToAdd = Math.floor(elapsedTime * this.refillRate);

    if (tokensToAdd > 0) {
      this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
      this.lastRefillTimestamp = now;
    }
  }

  getCurrentState() {
    this.refill(); // Tokenlarni yangilash

    return {
      tokens: this.tokens,
      capacity: this.capacity,
      lastRefillTimestamp: this.lastRefillTimestamp,
    };
  }
}

class TokenBucketRateLimiter {
  constructor(capacity, refillRate) {
    this.buckets = new Map();
    this.capacity = capacity;
    this.refillRate = refillRate;
  }

  getBucket(key) {
    if (!this.buckets.has(key)) {
      this.buckets.set(key, new TokenBucket(this.capacity, this.refillRate));
    }
    return this.buckets.get(key);
  }

  isAllowed(key) {
    const bucket = this.getBucket(key);
    return bucket.consume();
  }

  getCurrentState(key) {
    const bucket = this.getBucket(key);
    return bucket.getCurrentState();
  }
}

module.exports = { TokenBucketRateLimiter };
