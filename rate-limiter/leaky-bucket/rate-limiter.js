class LeakyBucket {
  constructor(capacity, consumeRate) {
    this.capacity = capacity;
    this.consumeRate = consumeRate;
    this.bucketQueue = [];
    this.lastConsumeTimestamp = Date.now();
    this.leakTimer = null;
  }

  // so`rovni queuega qo`shib qo`yadi agar to`la bo`lsa rad etadi
  fill(r) {
    if (this.bucketQueue.length >= this.capacity) {
      return false;
    }
    // Bo`sh navbatga birinchi element tushganda hisobni yangilaymiz —
    // bo`sh turgan vaqt "kredit" bo`lib to`planib, keyin birdan oqib chiqmasligi uchun.
    if (this.bucketQueue.length === 0) {
      this.lastConsumeTimestamp = Date.now();
    }
    this.bucketQueue.push(r);
    return true;
  }

  // So`rovlarni o`tgan vaqtga qarab ishga tushuradi.Timer tomonidan chaqiriladi
  consume() {
    const now = Date.now();

    if (this.bucketQueue.length === 0) {
      this.lastConsumeTimestamp = now;
      return [];
    }

    const elapsedTime = (now - this.lastConsumeTimestamp) / 1000;
    const requestToConsumeCount = Math.floor(elapsedTime * this.consumeRate);

    if (requestToConsumeCount === 0) {
      return [];
    }

    this.lastConsumeTimestamp +=
      (requestToConsumeCount / this.consumeRate) * 1000;

    return this.bucketQueue.splice(0, requestToConsumeCount);
  }

  // Orqa tarafdagi so`rovlarni process bo`` uchun timerni ishga tushiradi
  startLeaking(intervalMs = 100) {
    if (this.leakTimer) return;

    this.leakTimer = setInterval(() => {
      if (this.bucketQueue.length > 0) {
        const consumed = this.consume();
        if (consumed.length > 0) {
          this.onLeak?.(consumed); //log uchun
        }
      }
    }, intervalMs);
  }

  stopLeaking() {
    clearInterval(this.leakTimer);
    this.leakTimer = null;
  }

  getCurrentState() {
    return {
      queued: this.bucketQueue.length,
      capacity: this.capacity,
      consumeRate: this.consumeRate,
      isLeaking: this.leakTimer !== null,
    };
  }
}

// Har bir kalit (masalan, foydalanuvchi) uchun alohida leaky bucket saqlaydi.
// Token bucketdan farqi: qabul qilingan so'rov darhol emas, balki navbatdan
// olib (belgilangan tezlikda) process  qiladi - bu traffikni bir tekisda bo`lishini ta`minlaydi.
class LeakyBucketRateLimiter {
  constructor(capacity, consumeRate, intervalMs = 100) {
    this.buckets = new Map();
    this.capacity = capacity;
    this.consumeRate = consumeRate;
    this.intervalMs = intervalMs;
  }

  getBucket(key) {
    if (!this.buckets.has(key)) {
      const bucket = new LeakyBucket(this.capacity, this.consumeRate);
      // har bir so'rovning kutayotgan promise hal qilinadi.
      bucket.onLeak = (items) => {
        for (const item of items) item.resolve(true);
      };
      bucket.startLeaking(this.intervalMs);
      this.buckets.set(key, bucket);
    }
    return this.buckets.get(key);
  }

  // So'rovni navbatga qo'yadi.
  //  - navbatda joy bo'lsa: Promise tanlanganda `true` bilan hal bo'ladi.
  //  - navbat to'la bo'lsa: Promise darhol `false` bilan hal bo'ladi (rad etiladi).
  schedule(key) {
    const bucket = this.getBucket(key);
    return new Promise((resolve) => {
      const accepted = bucket.fill({ resolve });
      if (!accepted) resolve(false);
    });
  }

  getCurrentState(key) {
    return this.getBucket(key).getCurrentState();
  }

  // Barcha fon taymerlarini to'xtatadi (test/graceful shutdown uchun).
  stopAll() {
    for (const bucket of this.buckets.values()) {
      bucket.stopLeaking();
    }
  }
}

module.exports = { LeakyBucket, LeakyBucketRateLimiter };
