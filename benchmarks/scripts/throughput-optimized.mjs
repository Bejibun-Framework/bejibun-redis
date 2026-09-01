const realLog = console.log;
console.log = () => {};

const {default: RedisBuilder} = await import("../../builders/RedisBuilder.js");

const ITERATIONS = 20_000;
const WARMUP = 500;

for (let i = 0; i < WARMUP; i++) {
    void RedisBuilder.config;
    void RedisBuilder.config.default;
}

const t0 = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
    void RedisBuilder.config;
    void RedisBuilder.config.default;
}
const t1 = performance.now();

console.log = realLog;
process.stdout.write(String(t1 - t0));
