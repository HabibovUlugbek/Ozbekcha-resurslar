const { LeakyBucket, LeakyBucketRateLimiter } = require("./rate-limiter");

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✗ ${message}`);
    failed++;
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function section(title) {
  console.log(`\n── ${title}`);
}

(async () => {
  // ─────────────────────────────────────────────
  // Test 1: Sig'im ichidagi so'rovlar navbatga qo'yiladi
  // ─────────────────────────────────────────────
  section("Test 1: Requests within capacity are queued");
  {
    const bucket = new LeakyBucket(5, 1); // sig'im 5, 1 so'rov/sek

    let accepted = 0;
    for (let i = 0; i < 5; i++) {
      if (bucket.fill(i)) accepted++;
    }

    assert(accepted === 5, `All 5 requests queued (got ${accepted})`);
    assert(
      bucket.getCurrentState().queued === 5,
      "Queue holds exactly 5 items",
    );
  }

  // ─────────────────────────────────────────────
  // Test 2: Navbat to'lganda so'rovlar rad etiladi
  // ─────────────────────────────────────────────
  section("Test 2: Requests beyond capacity are rejected");
  {
    const bucket = new LeakyBucket(3, 1); // sig'im 3

    let accepted = 0;
    let rejected = 0;
    for (let i = 0; i < 6; i++) {
      bucket.fill(i) ? accepted++ : rejected++;
    }

    assert(accepted === 3, `Exactly 3 requests queued (got ${accepted})`);
    assert(rejected === 3, `Exactly 3 requests rejected (got ${rejected})`);
  }

  // ─────────────────────────────────────────────
  // Test 3: So'rovlar doimiy tezlikda oqib chiqadi
  // ─────────────────────────────────────────────
  section("Test 3: Requests leak at a constant rate");
  {
    const bucket = new LeakyBucket(10, 5); // 5 so'rov/sek oqadi

    for (let i = 0; i < 10; i++) bucket.fill(i);
    assert(bucket.getCurrentState().queued === 10, "Queue starts full at 10");

    // 1 soniya = ~5 element oqib chiqishi kerak
    await sleep(1050);
    bucket.consume();

    const remaining = bucket.getCurrentState().queued;
    assert(
      remaining >= 3 && remaining <= 6,
      `After ~1s, ~5 leaked (remaining ${remaining}, expected ~5)`,
    );
  }

  // ─────────────────────────────────────────────
  // Test 4: Navbat sig'imdan oshmaydi
  // ─────────────────────────────────────────────
  section("Test 4: Queue never exceeds capacity");
  {
    const bucket = new LeakyBucket(4, 1);

    for (let i = 0; i < 20; i++) bucket.fill(i); // sig'imdan ancha ko'p

    const state = bucket.getCurrentState();
    assert(
      state.queued <= state.capacity,
      `Queued (${state.queued}) does not exceed capacity (${state.capacity})`,
    );
  }

  // ─────────────────────────────────────────────
  // Test 5: Turli foydalanuvchilar mustaqil bucketlarga ega
  // ─────────────────────────────────────────────
  section("Test 5: Different users have independent buckets");
  {
    const limiter = new LeakyBucketRateLimiter(2, 1);

    // userA navbatini to'ldiramiz (2 ta qabul, 3-si rad)
    const a1 = limiter.schedule("userA");
    const a2 = limiter.schedule("userA");
    const a3 = limiter.schedule("userA"); // navbat to'la → darhol false

    // userB toza — birinchi so'rovi qabul qilinishi kerak
    const b1 = limiter.schedule("userB");

    const userAOverflow = await a3;
    assert(userAOverflow === false, "userA 3rd request rejected (queue full)");

    assert(
      limiter.getCurrentState("userB").queued >= 1,
      "userB has its own queue, unaffected by userA",
    );

    // Oqib chiqishlarini kutamiz va promislar hal bo'lishini tekshiramiz
    const [r1, r2, rb] = await Promise.all([a1, a2, b1]);
    assert(
      r1 === true && r2 === true && rb === true,
      "Queued requests eventually leak out (resolve true)",
    );

    limiter.stopAll();
  }

  // ─────────────────────────────────────────────
  // Test 6: schedule() qabul qilingan so'rovni oqqandan keyin hal qiladi
  // ─────────────────────────────────────────────
  section("Test 6: Accepted request resolves only after it leaks (pacing)");
  {
    const limiter = new LeakyBucketRateLimiter(5, 2); // 2 so'rov/sek

    // Bo'sh bucketga bitta so'rov — u ~0.5s ichida oqib chiqishi kerak
    const start = Date.now();
    const accepted = await limiter.schedule("pace");
    const elapsed = Date.now() - start;

    assert(accepted === true, "Single request accepted");
    assert(
      elapsed >= 150,
      `Request was paced (waited ${elapsed}ms before leaking, not instant)`,
    );

    limiter.stopAll();
  }

  // ─────────────────────────────────────────────
  // Summary
  // ─────────────────────────────────────────────
  console.log(`\n${"─".repeat(40)}`);
  console.log(`Results: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
})();
