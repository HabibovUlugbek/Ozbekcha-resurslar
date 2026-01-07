import http from "http";

const jobs = {};
const waitingClients = {};

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  if (req.method === "POST" && req.url === "/submit") {
    const jobId = `job:${Date.now()}`;
    jobs[jobId] = 0;
    waitingClients[jobId] = [];

    updateJob(jobId, 0);

    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ jobId }));
  }

  if (req.method === "GET" && req.url.startsWith("/checkstatus")) {
    const url = new URL(req.url, "http://localhost");
    const jobId = url.searchParams.get("jobId");

    if (!(jobId in jobs)) {
      res.writeHead(404);
      return res.end("Job not found");
    }

    if (jobs[jobId] >= 100) {
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(
        JSON.stringify({
          status: "completed",
          progress: 100,
        })
      );
    }

    waitingClients[jobId].push(res);

    // Safety timeout (30s)
    setTimeout(() => {
      const idx = waitingClients[jobId].indexOf(res);
      if (idx !== -1) {
        waitingClients[jobId].splice(idx, 1);
        res.writeHead(204);
        res.end();
      }
    }, 30000);

    return;
  }

  res.writeHead(404);
  res.end("Not found");
});

server.listen(8080, () =>
  console.log("Server running on http://localhost:8080")
);

function updateJob(jobId, prg) {
  jobs[jobId] = prg;
  console.log(`updated ${jobId} -> ${prg}%`);

  if (prg >= 100) {
    waitingClients[jobId].forEach((res) => {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          status: "completed",
          progress: 100,
        })
      );
    });

    waitingClients[jobId] = [];
    return;
  }

  setTimeout(() => updateJob(jobId, prg + 10), 1000);
}
