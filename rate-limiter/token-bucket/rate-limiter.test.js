const { TokenBucketRateLimiter } = require("./rate-limiter");

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

// ─────────────────────────────────────────────
// Test 1: Sig'im ichidagi so'rovlar ruxsat etiladi
// ─────────────────────────────────────────────
section("Test 1: Requests within capacity are allowed");
{
  const limiter = new TokenBucketRateLimiter(5, 1); // 5 tokens, refill 1/sec

  let allowed = 0;
  for (let i = 0; i < 5; i++) {
    if (limiter.isAllowed("user1")) allowed++;
  }

  assert(allowed === 5, `All 5 requests allowed (got ${allowed})`);
}

// ─────────────────────────────────────────────
// Test 2: Sig'imdan ortiq so'rovlar rad etiladi
// ─────────────────────────────────────────────
section("Test 2: Requests beyond capacity are rejected");
{
  const limiter = new TokenBucketRateLimiter(3, 1); // 3 tokens, refill 1/sec

  let allowed = 0;
  let rejected = 0;
  for (let i = 0; i < 6; i++) {
    limiter.isAllowed("user2") ? allowed++ : rejected++;
  }

  assert(allowed === 3, `Exactly 3 requests allowed (got ${allowed})`);
  assert(rejected === 3, `Exactly 3 requests rejected (got ${rejected})`);
}

// ─────────────────────────────────────────────
// Test 3: Vaqt o'tishi bilan tokenlar to'ldiriladi
// ─────────────────────────────────────────────
section("Test 3: Tokens refill over time");
(async () => {
  const limiter = new TokenBucketRateLimiter(3, 3); // 3 tokens, refill 3/sec

  // Barcha tokenlarni ishlatib bo'shatamiz
  for (let i = 0; i < 3; i++) limiter.isAllowed("user3");

  const beforeRefill = limiter.isAllowed("user3");
  assert(beforeRefill === false, "Bucket is empty — request rejected");

  // Wait 1 second for 3 tokens to refill
  await sleep(1000);

  let allowed = 0;
  for (let i = 0; i < 3; i++) {
    if (limiter.isAllowed("user3")) allowed++;
  }

  assert(
    allowed === 3,
    `After 1s refill, 3 new requests allowed (got ${allowed})`,
  );

  // ─────────────────────────────────────────────
  // Test 4: Tokenlar sig'imdan oshmaydi
  // ─────────────────────────────────────────────
  section("Test 4: Tokenlar sig'imdan oshmaydi");
  {
    const limiter2 = new TokenBucketRateLimiter(5, 10); // sig'im 5, tez to'ldirish

    // Barcha 5 tokenni ishlatib bo'shatamiz
    for (let i = 0; i < 5; i++) limiter2.isAllowed("user4");

    // 2 soniya kutamiz — 20 token qo'shiladi, lekin sig'im 5
    await sleep(2000);

    const state = limiter2.getCurrentState("user4");
    assert(
      state.tokens <= state.capacity,
      `Tokens (${state.tokens}) do not exceed capacity (${state.capacity})`,
    );

    let allowed = 0;
    for (let i = 0; i < 10; i++) {
      if (limiter2.isAllowed("user4")) allowed++;
    }
    assert(
      allowed === 5,
      `Only 5 requests allowed after overflow wait (got ${allowed})`,
    );
  }

  // ─────────────────────────────────────────────
  // Test 5: Turli foydalanuvchilar mustaqil bucketlarga ega
  // ─────────────────────────────────────────────
  section("Test 5: Turli foydalanuvchilar mustaqil bucketlarga ega");
  {
    const limiter3 = new TokenBucketRateLimiter(2, 1);

    // Drain userA completely
    limiter3.isAllowed("userA");
    limiter3.isAllowed("userA");
    const userAResult = limiter3.isAllowed("userA");

    // userB is untouched
    const userBResult = limiter3.isAllowed("userB");

    assert(
      userAResult === false,
      "userA bucket to'ldirilgandan so'ng cheklangan",
    );
    assert(userBResult === true, "userB userA cheklovidan ta'sirlanmagan");
  }

  // ─────────────────────────────────────────────
  // Test 6: Burst so'ng throttle qilish
  // ─────────────────────────────────────────────
  section("Test 6: Burst then throttle pattern");
  {
    const limiter4 = new TokenBucketRateLimiter(10, 2); // 10 burst, 2/sec refill

    // Burst: consume all 10
    let burst = 0;
    for (let i = 0; i < 10; i++) {
      if (limiter4.isAllowed("user6")) burst++;
    }
    assert(burst === 10, `Full burst of 10 allowed (got ${burst})`);

    // Immediately after burst — rejected
    assert(
      limiter4.isAllowed("user6") === false,
      "So'nggi burstdan keyin so'rov rad etildi",
    );
  }

  // ─────────────────────────────────────────────
  // Summary
  // ─────────────────────────────────────────────
  console.log(`\n${"─".repeat(40)}`);
  console.log(`Results: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
})();
