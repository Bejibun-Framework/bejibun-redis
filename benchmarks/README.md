# Benchmarks

Speed comparison: baseline (previously published npm release) vs the optimized `@bejibun/redis` in this repo.

## Running

```bash
# Run all benchmarks (installs baseline from npm first)
bun run bench

# Or run individually (after install-deps)
bun run install-deps
bun run coldstart
bun run throughput
```

## Cold Start

Measures package import time by spawning fresh OS processes. Two metrics:

- **Full process time** — spawn → exit (includes Bun boot time)
- **Import** — measured inside the process, isolates the package's own import cost

<!-- BENCHMARK:COLDSTART:START -->

|                             | baseline | optimized | speedup   |
| --------------------------- | -------- | --------- | --------- |
| Full process (spawn → exit) | 23.5ms   | 24.2ms    | **0.97x** |
| Import                      | 15.5ms   | 15.8ms    | **0.98x** |

<!-- BENCHMARK:COLDSTART:END -->

## Throughput

Config resolution speed — the hot path touched on every `RedisBuilder.call`. Baseline re-reads the config file from disk on each access; the optimized build returns a cached object. 20,000 iterations, median of 15 runs.

<!-- BENCHMARK:THROUGHPUT:START -->

| Method              | baseline (0.1.46) | optimized | speedup     | baseline ops/s | optimized ops/s |
| ------------------- | ----------------- | --------- | ----------- | -------------- | --------------- |
| `config resolution` | 63.3ms            | 0.6ms     | **109.91x** | 315,825/s      | 34,712,640/s    |

<!-- BENCHMARK:THROUGHPUT:END -->

## Facade Throughput (live Redis)

Requires a live Redis server on `127.0.0.1:6379`. Repeated `Redis.get`/`Redis.set` calls. Baseline disconnects and recreates the client after each operation; the optimized build keeps a persistent connection.

<!-- BENCHMARK:FACADE:START -->

| Method        | baseline (0.1.46) | optimized | speedup   | baseline ops/s | optimized ops/s |
| ------------- | ----------------- | --------- | --------- | -------------- | --------------- |
| `Redis.set()` | 215.6ms           | 45.2ms    | **4.77x** | 2,320/s        | 11,071/s        |
| `Redis.get()` | 201.4ms           | 43.2ms    | **4.66x** | 2,482/s        | 11,580/s        |

<!-- BENCHMARK:FACADE:END -->
