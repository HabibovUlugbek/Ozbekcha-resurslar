const http = require("http");

http
  .createServer((req, res) => {
    const from = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    console.log(`[server-a] ${req.method} ${req.url}  (from ${from})`);

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify(
        {
          server: "A",
          status: "ALLOWED",
          message: "You reached server-a through the Nginx forward proxy!",
          path: req.url,
        },
        null,
        2,
      ),
    );
  })
  .listen(3000, () => console.log("server-a listening on :3000"));
