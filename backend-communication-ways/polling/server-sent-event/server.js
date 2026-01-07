import http from "http";

const clients = new Set();
const jobs = {};

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  if (req.method === "GET" && req.url === "/events") {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });
    res.write("\n");
    clients.add(res);

    req.on("close", () => clients.delete(res));
    return;
  }

  if (req.method === "POST" && req.url === "/start") {
    const jobId = `job:${Date.now()}`;

    jobs[jobId] = { progress: 0, status: "RUNNING", timer: null };

    broadcast("job-start", { jobId });

    runJob(jobId);

    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ jobId }));
  }

  if (req.method === "POST" && req.url.startsWith("/cancel")) {
    const url = new URL(req.url, "http://localhost");
    const jobId = url.searchParams.get("jobId");

    const job = jobs[jobId];
    if (!job || job.status !== "RUNNING") {
      res.writeHead(404);
      return res.end("Job not found or already canceled");
    }

    job.status = "CANCELED";
    clearTimeout(job.timer);

    broadcast("job-cancel", { jobId });

    res.writeHead(200);
    return res.end("Canceled");
  }

  res.writeHead(404);
  res.end("Not found");
});

server.listen(8080, () =>
  console.log("SSE server running on http://localhost:8080")
);

function runJob(jobId) {
  const job = jobs[jobId];
  if (!job || job.status !== "RUNNING") return;

  job.progress += 1;

  broadcast("job-update", { jobId, progress: job.progress });

  job.timer = setTimeout(() => runJob(jobId), 1000);
}

function broadcast(event, data) {
  const payload =
    `event: ${event}\n` +
    `data: ${JSON.stringify({
      ...data,
      timestamp: new Date().toISOString(),
    })}\n\n`;

  clients.forEach((res) => res.write(payload));
}
