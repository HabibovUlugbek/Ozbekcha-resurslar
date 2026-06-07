const http = require("http");

http
  .createServer((req, res) => {
    console.log(
      `[server-b] ${req.method} ${req.url}  ← this should NEVER appear if proxy is working`,
    );

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify(
        {
          server: "B",
          status: "REACHED_DIRECTLY",
          warning:
            "You bypassed the proxy! The proxy should have returned 403.",
        },
        null,
        2,
      ),
    );
  })
  .listen(3000, () => console.log("server-b listening on :3000"));
