const { parentPort } = require("worker_threads");

parentPort.on("message", ({ taskId, number }) => {
  const result = fib(number);
  parentPort.postMessage({ taskId, result });
});

function fib(n) {
  const isBigInt = typeof n === "bigint";

  if (!isBigInt && !Number.isInteger(n)) {
    throw new TypeError("n must be an integer");
  }

  if (n <= 1) return n;

  let a = isBigInt ? 0n : 0;
  let b = isBigInt ? 1n : 1;

  for (let i = isBigInt ? 2n : 2; i <= n; i++) {
    [a, b] = [b, a + b];
  }

  return b;
}
