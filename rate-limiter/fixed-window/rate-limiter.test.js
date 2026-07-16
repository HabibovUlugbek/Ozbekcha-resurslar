const { FixedWindow, FixedWindowRateLimiter } = require("./rate-limiter");

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
    const window = new FixedWindow(1000, 5);

    let accepted = 0;
    for (let i = 0; i < 5; i++) {
      if (window.tryConsume()) accepted++;
    }

    assert(accepted === 5, `All 5 requests accepted (got ${accepted})`);
    assert(
      window.getState().requestCount === 5,
      "Counter reached exactly 5",
    );
  }

  section("Test 2: Requests beyond capacity are rejected");
  {
    const window = new FixedWindow(1000, 3);

    let accepted = 0;
    let rejected = 0;
    for (let i = 0; i < 6; i++) {
      window.tryConsume() ? accepted++ : rejected++;
    }

    assert(accepted === 3, `Exactly 3 requests accepted (got ${accepted})`);
    assert(rejected === 3, `Exactly 3 requests rejected (got ${rejected})`);
  }

  section("Test 3: Counter resets when the window expires");
  {
    const window = new FixedWindow(300, 2);

    assert(window.tryConsume() === true, "1st request accepted");
    assert(window.tryConsume() === true, "2nd request accepted");
    assert(window.tryConsume() === false, "3rd request rejected (limit hit)");

    await sleep(350);

    assert(
      window.tryConsume() === true,
      "After window reset, request accepted again",
    );
    assert(
      window.getState().requestCount === 1,
      "Counter restarted from 1 in the new window",
    );
  }

  section("Test 4: Counter never exceeds capacity");
  {
    const window = new FixedWindow(1000, 4);

    for (let i = 0; i < 20; i++) window.tryConsume();

    const state = window.getState();
    assert(
      state.requestCount <= state.capacity,
      `Counter (${state.requestCount}) does not exceed capacity (${state.capacity})`,
    );
  }

  section("Test 5: Different users have independent windows");
  {
    const limiter = new FixedWindowRateLimiter(2, 1000);

    assert(limiter.isAllowed("userA") === true, "userA 1st allowed");
    assert(limiter.isAllowed("userA") === true, "userA 2nd allowed");
    assert(limiter.isAllowed("userA") === false, "userA 3rd rejected");

    assert(
      limiter.isAllowed("userB") === true,
      "userB unaffected by userA's limit",
    );
    assert(
      limiter.getCurrentState("userB").requestCount === 1,
      "userB has its own independent counter",
    );
  }

  section("Test 6: Burst across the window boundary (known limitation)");
  {
    const limiter = new FixedWindowRateLimiter(3, 300);

    let firstWindow = 0;
    for (let i = 0; i < 3; i++) if (limiter.isAllowed("burst")) firstWindow++;

    await sleep(350);

    let secondWindow = 0;
    for (let i = 0; i < 3; i++) if (limiter.isAllowed("burst")) secondWindow++;

    assert(firstWindow === 3, "First window allowed 3 requests");
    assert(secondWindow === 3, "Second window allowed 3 more requests");
    assert(
      firstWindow + secondWindow === 6,
      "Boundary burst: 6 requests passed in a short span (fixed-window flaw)",
    );
  }

  console.log(`\n${"─".repeat(40)}`);
  console.log(`Results: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
})();
