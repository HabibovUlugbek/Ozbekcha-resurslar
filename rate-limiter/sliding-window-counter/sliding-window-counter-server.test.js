const http = require("http");

const SERVER_URL = "http://localhost:3000/sliding-window-counter";
const CAPACITY = 5;
const WINDOW_MS = 1000;

function sendRequest(userId) {
  return new Promise((resolve) => {
    const options = { headers: { "x-user-id": userId } };
    http
      .get(SERVER_URL, options, (res) => {
        let raw = "";
        res.on("data", (chunk) => (raw += chunk));
        res.on("end", () => {
          resolve({ status: res.statusCode, body: JSON.parse(raw) });
        });
      })
      .on("error", (err) => {
        resolve({ status: null, error: err.message });
      });
  });
}

async function simulateUser(userId, count) {
  const log = { userId, accepted: [], rejected: [] };

  for (let i = 1; i <= count; i++) {
    const { status } = await sendRequest(userId);
    if (status === 200) {
      log.accepted.push(i);
    } else {
      log.rejected.push(i);
    }
  }

  return log;
}

(async () => {
  const USERS = ["alice", "bob", "charlie"];
  const REQUESTS_PER_USER = 8;

  console.log(`${"─".repeat(55)}`);
  console.log(` Sliding-Window-Counter Server Test`);
  console.log(
    ` Capacity: ${CAPACITY} requests | Window: ${WINDOW_MS / 1000}s (weighted)`,
  );
  console.log(` Each user sends ${REQUESTS_PER_USER} rapid requests`);
  console.log(`${"─".repeat(55)}\n`);

  console.log("Phase 1 — Burst requests (all users simultaneously)\n");

  const results = await Promise.all(
    USERS.map((userId) => simulateUser(userId, REQUESTS_PER_USER)),
  );

  let allGood = true;

  for (const log of results) {
    console.log(`  User: ${log.userId}`);
    console.log(`    Accepted on requests : [${log.accepted.join(", ")}]`);
    console.log(`    Rejected on requests : [${log.rejected.join(", ")}]`);
    console.log(
      `    Summary : ${log.accepted.length} accepted, ${log.rejected.length} rejected\n`,
    );

    const okAccepted = log.accepted.length === CAPACITY;
    const okRejected = log.rejected.length === REQUESTS_PER_USER - CAPACITY;
    if (!okAccepted || !okRejected) {
      allGood = false;
      console.log(
        `    ✗ Expected ${CAPACITY} accepted / ${REQUESTS_PER_USER - CAPACITY} rejected`,
      );
    }
  }

  console.log(
    "Phase 2 — Soon after the burst, capacity is not fully refreshed (smoothed)\n",
  );

  await new Promise((resolve) => setTimeout(resolve, WINDOW_MS / 2));

  const midLog = await simulateUser("alice", CAPACITY);
  console.log(`  alice (half-window later)`);
  console.log(`    Accepted on requests : [${midLog.accepted.join(", ")}]`);
  console.log(`    Rejected on requests : [${midLog.rejected.join(", ")}]`);
  if (midLog.accepted.length >= CAPACITY) {
    allGood = false;
    console.log(
      `    ✗ Expected fewer than ${CAPACITY} accepted (weighted history should still throttle)`,
    );
  } else {
    console.log(`    ✓ Burst smoothed — full capacity not yet available`);
  }

  console.log(
    `\nPhase 3 — After two full windows, history ages out and capacity recovers\n`,
  );

  await new Promise((resolve) => setTimeout(resolve, WINDOW_MS * 2 + 100));

  const recoverLog = await simulateUser("bob", CAPACITY);
  console.log(`  bob (after two windows)`);
  console.log(`    Accepted on requests : [${recoverLog.accepted.join(", ")}]`);
  console.log(`    Rejected on requests : [${recoverLog.rejected.join(", ")}]`);
  if (recoverLog.accepted.length !== CAPACITY) {
    allGood = false;
    console.log(`    ✗ Expected ${CAPACITY} accepted after history aged out`);
  } else {
    console.log(`    ✓ Capacity recovered — full window available again`);
  }

  console.log(`\n${"─".repeat(55)}`);
  console.log(allGood ? " All e2e checks passed." : " Some e2e checks FAILED.");
  process.exit(allGood ? 0 : 1);
})();
