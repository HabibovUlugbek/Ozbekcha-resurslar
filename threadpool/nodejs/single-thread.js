const NUMBERS = require("./inputs");

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

console.time("single-thread");

const results = NUMBERS.map((n) => fib(n));

console.timeEnd("single-thread");

// console.log("Results:", results);
