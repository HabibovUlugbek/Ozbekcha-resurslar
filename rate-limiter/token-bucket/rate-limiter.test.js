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
// Test 1: Requests within capacity are allowed
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
// Test 2: Requests beyond capacity are rejected
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
// Test 3: Tokens refill over time
// ─────────────────────────────────────────────
section("Test 3: Tokens refill over time");
(async () => {
  const limiter = new TokenBucketRateLimiter(3, 3); // 3 tokens, refill 3/sec

  // Drain all tokens
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
  // Test 4: Tokens do not exceed capacity
  // ─────────────────────────────────────────────
  section("Test 4: Tokens do not exceed capacity");
  {
    const limiter2 = new TokenBucketRateLimiter(5, 10); // capacity 5, fast refill

    // Drain all 5
    for (let i = 0; i < 5; i++) limiter2.isAllowed("user4");

    // Wait 2 seconds — would add 20 tokens but cap is 5
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
  // Test 5: Different users have independent buckets
  // ─────────────────────────────────────────────
  section("Test 5: Different users have independent buckets");
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
      "userA is rate-limited after exhausting bucket",
    );
    assert(userBResult === true, "userB is unaffected by userA's limit");
  }

  // ─────────────────────────────────────────────
  // Test 6: Burst then throttle
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
      "Request rejected immediately after burst",
    );
  }

  // ─────────────────────────────────────────────
  // Summary
  // ─────────────────────────────────────────────
  console.log(`\n${"─".repeat(40)}`);
  console.log(`Results: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
})();
