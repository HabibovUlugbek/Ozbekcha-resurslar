const {
  SlidingWindowLog,
  SlidingWindowLogRateLimiter,
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
    const window = new SlidingWindowLog(1000, 5);

    let accepted = 0;
    for (let i = 0; i < 5; i++) {
      if (window.isAllowed()) accepted++;
    }

    assert(accepted === 5, `All 5 requests accepted (got ${accepted})`);
    assert(window.getCurrentState().count === 5, "Log holds exactly 5 entries");
  }

  section("Test 2: Requests beyond capacity are rejected");
  {
    const window = new SlidingWindowLog(1000, 3);

    let accepted = 0;
    let rejected = 0;
    for (let i = 0; i < 6; i++) {
      window.isAllowed() ? accepted++ : rejected++;
    }

    assert(accepted === 3, `Exactly 3 requests accepted (got ${accepted})`);
    assert(rejected === 3, `Exactly 3 requests rejected (got ${rejected})`);
  }

  section("Test 3: Old timestamps slide out of the window");
  {
    const window = new SlidingWindowLog(300, 2);

    assert(window.isAllowed() === true, "1st request accepted");
    assert(window.isAllowed() === true, "2nd request accepted");
    assert(window.isAllowed() === false, "3rd request rejected (window full)");

    await sleep(350);

    assert(
      window.isAllowed() === true,
      "After old entries expire, request accepted again",
    );
    assert(
      window.getCurrentState().count === 1,
      "Only the fresh request remains in the log",
    );
  }

  section("Test 4: Log never exceeds capacity");
  {
    const window = new SlidingWindowLog(1000, 4);

    for (let i = 0; i < 20; i++) window.isAllowed();

    const state = window.getCurrentState();
    assert(
      state.count <= state.capacity,
      `Log count (${state.count}) does not exceed capacity (${state.capacity})`,
    );
    assert(state.remaining === 0, "Remaining is 0 when the window is full");
  }

  section("Test 5: Different users have independent windows");
  {
    const limiter = new SlidingWindowLogRateLimiter(1000, 2);

    assert(limiter.isAllowed("userA") === true, "userA 1st allowed");
    assert(limiter.isAllowed("userA") === true, "userA 2nd allowed");
    assert(limiter.isAllowed("userA") === false, "userA 3rd rejected");

    assert(
      limiter.isAllowed("userB") === true,
      "userB unaffected by userA's limit",
    );
    assert(
      limiter.getCurrentState("userB").count === 1,
      "userB has its own independent log",
    );
  }

  section("Test 6: No boundary burst (advantage over fixed window)");
  {
    const limiter = new SlidingWindowLogRateLimiter(500, 3);

    for (let i = 0; i < 3; i++) limiter.isAllowed("burst");

    await sleep(300);

    const state = limiter.getCurrentState("burst");
    assert(
      state.count === 3,
      "Old requests still counted mid-window (sliding, not reset)",
    );
    assert(
      limiter.isAllowed("burst") === false,
      "Boundary burst prevented — request still rejected",
    );
  }

  console.log(`\n${"─".repeat(40)}`);
  console.log(`Results: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
})();
