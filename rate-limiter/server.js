const http = require("http");
const { TokenBucketRateLimiter } = require("./token-bucket/rate-limiter");

const rateLimiter = new TokenBucketRateLimiter(5, 1); // 5 token, 1 token/sekund

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

function handleRequest(req, res) {
  if (req.url === "/token-bucket") {
    const userId = req.headers["x-user-id"] || "default-user";

    rateLimiterMiddleware(req, res, () => {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          message: "So'rov qabul qilindi",
          state: rateLimiter.getCurrentState(userId),
        }),
      );
    });
  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Not found" }));
  }
}

const server = http.createServer(handleRequest);

server.listen(3000, () => {
  console.log("Server 3000-portda ishga tushdi...");
});
