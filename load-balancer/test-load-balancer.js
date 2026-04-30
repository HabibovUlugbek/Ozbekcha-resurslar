const http = require("http");

const TOTAL_REQUESTS = 1000;
const LB_URL = "http://localhost:4000";

let completedRequests = 0;
const responseCounts = {}; // Server javoblarini sanash uchun obyekt

for (let i = 0; i < TOTAL_REQUESTS; i++) {
  http
    .get(LB_URL, (res) => {
      let body = "";
      res.on("data", (chunk) => {
        body += chunk;
      });
      res.on("end", () => {
        const match = body.match(/Server\d+/);
        if (match) {
          const serverName = match[0];
          responseCounts[serverName] = (responseCounts[serverName] || 0) + 1;
        } else {
          console.warn("Unknown response format:", body);
          responseCounts["unknown"] = (responseCounts["unknown"] || 0) + 1;
        }

        completedRequests++;
        if (completedRequests === TOTAL_REQUESTS) {
          console.log("Responses received from servers:", responseCounts);
        }
      });
    })
    .on("error", (err) => {
      console.error("Request error:", err.message);
      completedRequests++;
      if (completedRequests === TOTAL_REQUESTS) {
        console.log("Responses received from servers:", responseCounts);
      }
    });
}
