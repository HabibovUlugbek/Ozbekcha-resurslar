const http = require("http");
const { TokenBucketRateLimiter } = require("./token-bucket/rate-limiter");
const { LeakyBucketRateLimiter } = require("./leaky-bucket/rate-limiter");
const { FixedWindowRateLimiter } = require("./fixed-window/rate-limiter");
const {
  SlidingWindowLogRateLimiter,
} = require("./sliding-window-log/rate-limiter");
const {
  SlidingWindowCounterRateLimiter,
} = require("./sliding-window-counter/rate-limiter");

const rateLimiter = new TokenBucketRateLimiter(5, 1); // 5 token, 1 token/sekund
const leakyRateLimiter = new LeakyBucketRateLimiter(5, 1); // 5 navbat, 1 so'rov/sekund oqadi
const fixedWindowRateLimiter = new FixedWindowRateLimiter(5, 1000); // 5 so'rov / 1 sekundlik interval
const slidingWindowLogRateLimiter = new SlidingWindowLogRateLimiter(1000, 5); // 1 sekundlik siljuvchi interval, 5 so'rov
const slidingWindowCounterRateLimiter = new SlidingWindowCounterRateLimiter(
  1000,
  5,
); // 1 sekundlik interval, 5 so'rov (oldingi interval vaznlanadi)

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
  } else if (req.url === "/fixed-window") {
    // Fixed window sinxron ishlaydi: intervalda joy bo'lsa 200, limit tugagan
    // bo'lsa darhol 429 qaytadi. Interval tugaganda hisob nolga tushadi.
    if (fixedWindowRateLimiter.isAllowed(userId)) {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          message: "So'rov qabul qilindi",
          state: fixedWindowRateLimiter.getCurrentState(userId),
        }),
      );
    } else {
      res.writeHead(429, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          message: "So'rov rad etildi - interval limiti oshib ketdi",
          state: fixedWindowRateLimiter.getCurrentState(userId),
        }),
      );
    }
  } else if (req.url === "/sliding-window-log") {
    // Sliding window log ham sinxron ishlaydi, lekin interval "siljiydi": har
    // so'rovning timestampi saqlanadi va faqat oxirgi interval ichidagilar sanaladi.
    // Shu bois fixed window'dagi interval chegarasi burst muammosi bo'lmaydi.
    if (slidingWindowLogRateLimiter.isAllowed(userId)) {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          message: "So'rov qabul qilindi",
          state: slidingWindowLogRateLimiter.getCurrentState(userId),
        }),
      );
    } else {
      res.writeHead(429, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          message: "So'rov rad etildi - siljuvchi interval limiti oshib ketdi",
          state: slidingWindowLogRateLimiter.getCurrentState(userId),
        }),
      );
    }
  } else if (req.url === "/sliding-window-counter") {
    // Sliding window counter: har so'rovni sanaydi, lekin interval chegarasida
    // oldingi interval hisobini vaznlab qo'shadi. Shu bilan fixed window'ning burst
    // muammosini yumshatadi, sliding window log'ga qaraganda esa kam xotira ishlatadi.
    if (slidingWindowCounterRateLimiter.isAllowed(userId)) {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          message: "So'rov qabul qilindi",
          state: slidingWindowCounterRateLimiter.getCurrentState(userId),
        }),
      );
    } else {
      res.writeHead(429, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          message: "So'rov rad etildi - interval limiti oshib ketdi",
          state: slidingWindowCounterRateLimiter.getCurrentState(userId),
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
