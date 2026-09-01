const realLog = console.log;
console.log = () => {};

const {default: Redis} = await import("../../index.js");

const ITERATIONS = 500;
const WARMUP = 20;

async function bench(fn) {
    for (let i = 0; i < WARMUP; i++) await fn(i);
    const t0 = performance.now();
    for (let i = 0; i < ITERATIONS; i++) await fn(i);
    const t1 = performance.now();
    return t1 - t0;
}

const setMs = await bench((i) => Redis.set(`bench:set:${i % 10}`, {n: i}));
const getMs = await bench(async (i) => {
    await Redis.get(`bench:set:${i % 10}`);
});

console.log = realLog;
process.stdout.write(JSON.stringify({setMs, getMs}));
