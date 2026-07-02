const http = require("http");
const { TokenBucketRateLimiter } = require("./token-bucket/rate-limiter");
const { LeakyBucketRateLimiter } = require("./leaky-bucket/rate-limiter");

const rateLimiter = new TokenBucketRateLimiter(5, 1); // 5 token, 1 token/sekund
const leakyRateLimiter = new LeakyBucketRateLimiter(5, 1); // 5 navbat, 1 so'rov/sekund oqadi

function rateLimiterMiddleware(req, res, next) {
  const userId = req.headers["x-user-id"] || "default-user";

  if (rateLimiter.isAllowed(userId)) {
    next();
  } else {
    res.writeHead(429, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        message: "So'rov rad etildi - limit oshib ketdi",
        state: rateLimiter.getCurrentState(userId),
      }),
    );
  }
}

async function handleRequest(req, res) {
  const userId = req.headers["x-user-id"] || "default-user";

  if (req.url === "/token-bucket") {
    rateLimiterMiddleware(req, res, () => {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          message: "So'rov qabul qilindi",
          state: rateLimiter.getCurrentState(userId),
        }),
      );
    });
  } else if (req.url === "/leaky-bucket") {
    // Leaky bucket navbatga qo'yadi: qabul qilingan so'rov process qilinganda(belgilangan
    // tezlikda) javob beriladi; navbat to'la bo'lsa darhol 429 qaytadi.
    const accepted = await leakyRateLimiter.schedule(userId);

    if (accepted) {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          message: "So'rov qayta ishlandi (navbatdan oqib chiqdi)",
          state: leakyRateLimiter.getCurrentState(userId),
        }),
      );
    } else {
      res.writeHead(429, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          message: "So'rov rad etildi - navbat to'lgan",
          state: leakyRateLimiter.getCurrentState(userId),
        }),
      );
    }
  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Not found" }));
  }
}

const server = http.createServer(handleRequest);

server.listen(3000, () => {
  console.log("Server 3000-portda ishga tushdi...");
});
