const http = require("http");

const SERVER_URL = "http://localhost:3000/leaky-bucket";
const CAPACITY = 5; // serverdagi limiter bilan mos: new LeakyBucketRateLimiter(5, 1)
const CONSUME_RATE = 1; // sekundiga qancha so'rov process qilinadi

function sendRequest(userId) {
  const start = Date.now();
  return new Promise((resolve) => {
    const options = { headers: { "x-user-id": userId } };
    http
      .get(SERVER_URL, options, (res) => {
        let raw = "";
        res.on("data", (chunk) => (raw += chunk));
        res.on("end", () => {
          resolve({ status: res.statusCode, latency: Date.now() - start });
        });
      })
      .on("error", (err) => {
        resolve({ status: null, error: err.message });
      });
  });
}

// Leaky bucketda rad etish faqat bir vaqtda (parallel) so'rovlar navbatni
// to'ldirganda ko'rinadi — shuning uchun so'rovlarni birga yuboramiz.
async function burstUser(userId, count) {
  const results = await Promise.all(
    Array.from({ length: count }, () => sendRequest(userId)),
  );

  const accepted = results.filter((r) => r.status === 200);
  const rejected = results.filter((r) => r.status === 429);

  return { userId, accepted, rejected, results };
}

(async () => {
  const USERS = ["alice", "bob", "charlie"];
  const REQUESTS_PER_USER = 8; // sig'imdan ko'p → ba'zilari rad etilishi kerak

  console.log(`${"─".repeat(55)}`);
  console.log(` Leaky-Bucket Server Test`);
  console.log(
    ` Capacity: ${CAPACITY} queued | Leak: ${CONSUME_RATE} request/sec`,
  );
  console.log(` Each user fires ${REQUESTS_PER_USER} concurrent requests`);
  console.log(`${"─".repeat(55)}\n`);

  console.log("Phase 1 — Concurrent burst (all users simultaneously)\n");

  const results = await Promise.all(
    USERS.map((userId) => burstUser(userId, REQUESTS_PER_USER)),
  );

  let allGood = true;

  for (const log of results) {
    const latencies = log.accepted.map((r) => `${r.latency}ms`);
    console.log(`  User: ${log.userId}`);
    console.log(
      `    Accepted : ${log.accepted.length} (leaked at [${latencies.join(", ")}])`,
    );
    console.log(`    Rejected : ${log.rejected.length} (queue was full)`);

    // Sig'im 5 → 5 qabul, qolgan 3 rad etilishi kutiladi.
    const okAccepted = log.accepted.length === CAPACITY;
    const okRejected = log.rejected.length === REQUESTS_PER_USER - CAPACITY;
    // Qabul qilinganlar bir zumda emas, tezlik bo'yicha tekislangan bo'lishi kerak.
    const paced = log.accepted.some((r) => r.latency >= 500);

    if (!okAccepted || !okRejected) {
      allGood = false;
      console.log(
        `    ✗ Expected ${CAPACITY} accepted / ${REQUESTS_PER_USER - CAPACITY} rejected`,
      );
    } else {
      console.log(`    ✓ Capacity enforced (${CAPACITY} accepted)`);
    }

    if (!paced) {
      allGood = false;
      console.log(`    ✗ Accepted requests were not paced (leaked instantly)`);
    } else {
      console.log(`    ✓ Accepted requests were paced by leak rate`);
    }
    console.log();
  }

  console.log("Phase 2 — After draining, a fresh request is accepted again\n");

  // Navbatlar oqib bo'lgach, yangi so'rov qayta qabul qilinishi kerak.
  await new Promise((resolve) => setTimeout(resolve, 1500));
  const followUp = await sendRequest("alice");
  console.log(
    `  alice follow-up → status ${followUp.status} (${followUp.latency}ms)`,
  );
  if (followUp.status !== 200) {
    allGood = false;
    console.log("    ✗ Expected 200 after queue drained");
  } else {
    console.log("    ✓ Bucket recovered — request accepted");
  }

  console.log(`\n${"─".repeat(55)}`);
  console.log(allGood ? " All e2e checks passed." : " Some e2e checks FAILED.");
  process.exit(allGood ? 0 : 1);
})();
