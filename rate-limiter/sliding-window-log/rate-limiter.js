class SlidingWindowLog {
  constructor(windowMs, capacity) {
    this.windowMs = windowMs;
    this.capacity = capacity;
    this.log = [];
  }

  isAllowed() {
    const now = Date.now();
    while (this.log.length && this.log[0] <= now - this.windowMs) {
      this.log.shift();
    }

    if (this.log.length < this.capacity) {
      this.log.push(now);
      return true;
    }

    return false;
  }

  getCurrentState() {
    const now = Date.now();
    while (this.log.length && this.log[0] <= now - this.windowMs) {
      this.log.shift();
    }
    return {
      count: this.log.length,
      capacity: this.capacity,
      remaining: this.capacity - this.log.length,
      oldestTimestamp: this.log[0] ?? null,
    };
  }
}

class SlidingWindowLogRateLimiter {
  constructor(windowMs, capacity) {
    this.windows = new Map();
    this.windowMs = windowMs;
    this.capacity = capacity;
  }

  getWindow(key) {
    if (!this.windows.has(key)) {
      this.windows.set(key, new SlidingWindowLog(this.windowMs, this.capacity));
    }
    return this.windows.get(key);
  }

  isAllowed(key) {
    return this.getWindow(key).isAllowed();
  }

  getCurrentState(key) {
    return this.getWindow(key).getCurrentState();
  }
}

module.exports = { SlidingWindowLog, SlidingWindowLogRateLimiter };
