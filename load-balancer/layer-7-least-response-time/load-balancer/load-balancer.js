const http = require("http");

const backends = [
  { name: "Server1", url: "http://backend1:3000" },
  { name: "Server2", url: "http://backend2:3000" },
  { name: "Server3", url: "http://backend3:3000" },
];

const totalTime = new Array(backends.length).fill(0); // har backend uchun javob vaqtlarini yig'ish uchun massiv
const reqCount = new Array(backends.length).fill(0); // har backend uchun yuborilgan so'rovlar soni

// ─── helpers ────────────────────────────────────────────────────────────────

function getAvg(i) {
  if (reqCount[i] === 0) return null; // hali ishlatilmagan backend uchun o'rtacha vaqtni hisoblash mumkin emas
  return totalTime[i] / reqCount[i]; // aniq arifmetik o'rtacha
}

function pickServer() {
  // Phase 1 – har backend uchun kamida bitta so'rov yuborish
  const untried = backends.findIndex((_, i) => reqCount[i] === 0);
  if (untried !== -1) return untried;

  // Phase 2 – eng past o'rtacha javob vaqtiga ega backendni tanlash
  let best = 0;
  let bestAvg = getAvg(0);
  for (let i = 1; i < backends.length; i++) {
    const avg = getAvg(i);
    if (avg < bestAvg) {
      bestAvg = avg;
      best = i;
    }
  }
  return best;
}

function statsLine() {
  return backends
    .map((b, i) => {
      const avg = getAvg(i);
      return (
        `${b.name}: count=${reqCount[i]}, ` +
        `totalTime=${totalTime[i]}ms, ` +
        `avg=${avg !== null ? avg.toFixed(2) + "ms" : "N/A"}`
      );
    })
    .join(" | ");
}

// ─── proxy server ────────────────────────────────────────────────────────────

const lb = http.createServer((clientReq, clientRes) => {
  const idx = pickServer();
  const target = backends[idx];

  // So'rov yuborishdan oldin tanlangan backend va uning hozirgi statistikasi haqida log yozish
  console.log(
    `\n[REQUEST] Choosing ${target.name} ` +
      `(lowest avg so far)\n  Stats BEFORE: ${statsLine()}`,
  );

  const start = Date.now();

  const options = {
    hostname: new URL(target.url).hostname,
    port: new URL(target.url).port || 80,
    path: clientReq.url,
    method: clientReq.method,
    headers: clientReq.headers,
  };

  const proxyReq = http.request(options, (proxyRes) => {
    let body = "";
    proxyRes.on("data", (chunk) => (body += chunk));
    proxyRes.on("end", () => {
      const duration = Date.now() - start;

      totalTime[idx] += duration;
      reqCount[idx] += 1;

      // Javobdan so'ng log yozish, shunda yangi o'rtacha qiymatni tekshirish mumkin
      console.log(
        `[RESPONSE] ${target.name} replied in ${duration}ms\n` +
          `  Stats AFTER:  ${statsLine()}`,
      );

      clientRes.writeHead(proxyRes.statusCode, proxyRes.headers);
      clientRes.end(body);
    });
  });

  proxyReq.on("error", (err) => {
    console.error(`[ERROR] ${target.name}: ${err.message}`);
    clientRes.writeHead(502);
    clientRes.end("Bad Gateway");
  });

  clientReq.pipe(proxyReq);
});

lb.listen(4000, () => console.log("Fastest-response LB listening on :4000\n"));
