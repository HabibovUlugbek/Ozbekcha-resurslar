class FixedWindow {
  constructor(windowMs, capacity) {
    this.capacity = capacity;
    this.requestCount = 0;
    this.windowMs = windowMs;
    this.windowResetAt = Date.now() + windowMs;
  }

  tryConsume() {
    this.resetWindowIfExpired();

    if (this.requestCount >= this.capacity) {
      return false;
    } else {
      this.requestCount++;
      return true;
    }
  }

  resetWindowIfExpired() {
    if (Date.now() > this.windowResetAt) {
      this.requestCount = 0;
      this.windowResetAt = Date.now() + this.windowMs;
    }
  }

  getState() {
    this.resetWindowIfExpired();

    return {
      requestCount: this.requestCount,
      capacity: this.capacity,
      windowResetAt: this.windowResetAt,
    };
  }
}

class FixedWindowRateLimiter {
  constructor(capacity, windowMs) {
    this.windows = new Map();
    this.capacity = capacity;
    this.windowMs = windowMs;
  }

  getWindow(key) {
    if (!this.windows.has(key)) {
      this.windows.set(key, new FixedWindow(this.windowMs, this.capacity));
    }
    return this.windows.get(key);
  }

  isAllowed(key) {
    const window = this.getWindow(key);
    return window.tryConsume();
  }

  getCurrentState(key) {
    const window = this.getWindow(key);
    return window.getState();
  }
}

module.exports = { FixedWindow, FixedWindowRateLimiter };
