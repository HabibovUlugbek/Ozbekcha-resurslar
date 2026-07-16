class SlidingWindowCounter {
  #capacity;
  #windowMs;
  #windowStart;
  #currentCount = 0;
  #previousCount = 0;

  constructor(windowMs, capacity) {
    this.#windowMs = windowMs;
    this.#capacity = capacity;
    this.#windowStart = Date.now();
  }

  tryConsume() {
    this.#roll();
    if (this.#estimate() >= this.#capacity) {
      return false;
    }
    this.#currentCount++;
    return true;
  }

  #estimate() {
    const elapsed = Date.now() - this.#windowStart;
    const prevWeight = 1 - elapsed / this.#windowMs;
    return this.#previousCount * prevWeight + this.#currentCount;
  }

  #roll() {
    const elapsedWindows = Math.floor(
      (Date.now() - this.#windowStart) / this.#windowMs,
    );
    if (elapsedWindows <= 0) return;

    this.#previousCount = elapsedWindows === 1 ? this.#currentCount : 0;
    this.#currentCount = 0;
    this.#windowStart += elapsedWindows * this.#windowMs;
  }

  getState() {
    this.#roll();
    return {
      previousCount: this.#previousCount,
      currentCount: this.#currentCount,
      estimated: this.#estimate(),
      capacity: this.#capacity,
      windowEndsAt: this.#windowStart + this.#windowMs,
    };
  }
}

class SlidingWindowCounterRateLimiter {
  constructor(windowMs, capacity) {
    this.windows = new Map();
    this.windowMs = windowMs;
    this.capacity = capacity;
  }

  getWindow(key) {
    if (!this.windows.has(key)) {
      this.windows.set(
        key,
        new SlidingWindowCounter(this.windowMs, this.capacity),
      );
    }
    return this.windows.get(key);
  }

  isAllowed(key) {
    return this.getWindow(key).tryConsume();
  }

  getCurrentState(key) {
    return this.getWindow(key).getState();
  }
}

module.exports = { SlidingWindowCounter, SlidingWindowCounterRateLimiter };
