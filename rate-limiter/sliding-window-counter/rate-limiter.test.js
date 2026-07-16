const {
  SlidingWindowCounter,
  SlidingWindowCounterRateLimiter,
} = require("./rate-limiter");

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
  section("Test 1: Requests within capacity are accepted");
  {
    const window = new SlidingWindowCounter(1000, 5);

    let accepted = 0;
    for (let i = 0; i < 5; i++) {
      if (window.tryConsume()) accepted++;
    }

    assert(accepted === 5, `All 5 requests accepted (got ${accepted})`);
    assert(
      window.getState().currentCount === 5,
      "Current counter reached exactly 5",
    );
  }

  section("Test 2: Requests beyond capacity are rejected");
  {
    const window = new SlidingWindowCounter(1000, 3);

    let accepted = 0;
    let rejected = 0;
    for (let i = 0; i < 6; i++) {
      window.tryConsume() ? accepted++ : rejected++;
    }

    assert(accepted === 3, `Exactly 3 requests accepted (got ${accepted})`);
    assert(rejected === 3, `Exactly 3 requests rejected (got ${rejected})`);
  }

  section("Test 3: Counter fully resets after two windows elapse");
  {
    const window = new SlidingWindowCounter(300, 5);

    for (let i = 0; i < 5; i++) window.tryConsume();
    assert(window.tryConsume() === false, "Full window rejects extra request");

    await sleep(650);

    const state = window.getState();
    assert(
      state.previousCount === 0 && state.currentCount === 0,
      "Both counters cleared after 2 windows",
    );
    assert(window.tryConsume() === true, "Fresh request accepted after reset");
  }

  section("Test 4: Estimate never exceeds capacity");
  {
    const window = new SlidingWindowCounter(1000, 4);

    for (let i = 0; i < 20; i++) window.tryConsume();

    const state = window.getState();
    assert(
      state.estimated <= state.capacity,
      `Estimate (${state.estimated}) does not exceed capacity (${state.capacity})`,
    );
  }

  section("Test 5: Different users have independent counters");
  {
    const limiter = new SlidingWindowCounterRateLimiter(1000, 2);

    assert(limiter.isAllowed("userA") === true, "userA 1st allowed");
    assert(limiter.isAllowed("userA") === true, "userA 2nd allowed");
    assert(limiter.isAllowed("userA") === false, "userA 3rd rejected");

    assert(
      limiter.isAllowed("userB") === true,
      "userB unaffected by userA's limit",
    );
    assert(
      limiter.getCurrentState("userB").currentCount === 1,
      "userB has its own independent counter",
    );
  }

  section("Test 6: Boundary burst is smoothed (advantage over fixed window)");
  {
    const window = new SlidingWindowCounter(400, 10);

    for (let i = 0; i < 10; i++) window.tryConsume();

    await sleep(600);

    let accepted = 0;
    for (let i = 0; i < 10; i++) if (window.tryConsume()) accepted++;

    assert(
      accepted >= 3 && accepted <= 7,
      `Only ~5 accepted mid-window, not full 10 (got ${accepted})`,
    );
  }

  console.log(`\n${"─".repeat(40)}`);
  console.log(`Results: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
})();
