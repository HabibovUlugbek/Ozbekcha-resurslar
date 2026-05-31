const http = require("http");

const SERVER_URL = "http://localhost:3000/token-bucket";
const CAPACITY = 5; // serverdagi limiter sig'imi bilan mos bo'lishi kerak: new TokenBucketRateLimiter(5, 1)
const REFILL_RATE = 1; // tokenlar soni sekundiga qancha to'ldiriladi
const WAIT_MS = 3000; // 3 soniya kut → ~3 token qayta to'ldirilishi kerak

function sendRequest(userId) {
  return new Promise((resolve) => {
    const options = {
      headers: { "x-user-id": userId },
    };
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
  const REQUESTS_PER_USER = 8; // sig'imdan ko'p so'rov yuborib, rad etilishni ko'rsatish uchun

  console.log(`${"─".repeat(55)}`);
  console.log(` Token-Bucket Server Test`);
  console.log(
    ` Capacity: ${CAPACITY} tokens | Refill: ${REFILL_RATE} token/sec`,
  );
  console.log(` Each user sends ${REQUESTS_PER_USER} rapid requests`);
  console.log(`${"─".repeat(55)}\n`);

  console.log("Phase 1 — Burst requests (all users simultaneously)\n");

  const results = await Promise.all(
    USERS.map((userId) => simulateUser(userId, REQUESTS_PER_USER)),
  );

  for (const log of results) {
    console.log(`  User: ${log.userId}`);
    console.log(`    Accepted on requests : [${log.accepted.join(", ")}]`);
    console.log(`    Rejected on requests : [${log.rejected.join(", ")}]`);
    console.log(
      `    Summary : ${log.accepted.length} accepted, ${log.rejected.length} rejected\n`,
    );
  }

  const refillTokens = Math.min(
    CAPACITY,
    Math.floor((WAIT_MS / 1000) * REFILL_RATE),
  );
  console.log(
    `Phase 2 — Waiting ${WAIT_MS / 1000}s for ~${refillTokens} token(s) to refill...\n`,
  );
  await new Promise((resolve) => setTimeout(resolve, WAIT_MS));

  for (const user of USERS) {
    const retryLog = await simulateUser(user, refillTokens);
    console.log(`  User: ${user} (after wait)`);
    console.log(`    Accepted on requests : [${retryLog.accepted.join(", ")}]`);
    console.log(`    Rejected on requests : [${retryLog.rejected.join(", ")}]`);
    console.log(
      `    Summary : ${retryLog.accepted.length} accepted, ${retryLog.rejected.length} rejected\n`,
    );
  }

  console.log(`${"─".repeat(55)}`);
  console.log(" Done.");
})();
