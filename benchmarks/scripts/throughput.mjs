/**
 * Throughput benchmark.
 *
 * Measures config-resolution speed, the hot path touched on every RedisBuilder call.
 * On baseline each access re-reads the config file from disk (`fs.existsSync` +
 * `require()`); the optimized build returns a cached object instead.
 *
 * Run: bun run scripts/throughput.mjs
 */
import {spawnSync} from "node:child_process";
import {fileURLToPath} from "node:url";
import path from "node:path";
import {printTable} from "./table-format.mjs";
import {updateReadmeSection} from "./readme-writer.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TRIALS = 15;
const runtime = process.execPath;

function runTrials(scriptPath) {
    const times = [];
    for (let i = 0; i < TRIALS; i++) {
        const res = spawnSync(runtime, [scriptPath], {encoding: "utf8"});
        if (res.status !== 0) {
            console.error("Benchmark failed:", res.stderr);
            process.exit(1);
        }
        times.push(parseFloat(res.stdout.trim()));
    }
    return times;
}

function stats(arr) {
    const sorted = [...arr].sort((a, b) => a - b);
    return sorted[Math.floor(sorted.length / 2)];
}

const ITERATIONS = 20_000;
const bMs = stats(runTrials(path.join(__dirname, "throughput-baseline.mjs")));
const oMs = stats(runTrials(path.join(__dirname, "throughput-optimized.mjs")));

function fmt(ms) {
    return ms < 1 ? `${(ms * 1000).toFixed(0)}\u00B5s` : `${ms.toFixed(1)}ms`;
}

function sp(b, o) {
    const r = b / o;
    return r >= 1.05 ? `${r.toFixed(2)}x` : r <= 0.95 ? `${r.toFixed(2)}x` : "~1.0x";
}

function ops(ms) {
    return Math.round(ITERATIONS / (ms / 1000)).toLocaleString() + "/s";
}

printTable({
    title: "THROUGHPUT BENCHMARK",
    subtitle: `${ITERATIONS.toLocaleString()} config resolutions each, ${TRIALS} runs (median)`,
    headers: ["Method", "Baseline (0.1.46)", "Optimized", "Speedup", "Optimized ops/s"],
    rows: [{cells: ["config resolution", fmt(bMs), fmt(oMs), sp(bMs, oMs), ops(oMs)]}]
});

const table = [
    "| Method | baseline (0.1.46) | optimized | speedup | baseline ops/s | optimized ops/s |",
    "|---|---|---|---|---|---|",
    `| \`config resolution\` | ${bMs.toFixed(1)}ms | ${oMs.toFixed(1)}ms | **${(bMs / oMs).toFixed(2)}x** | ${ops(bMs)} | ${ops(oMs)} |`
].join("\n");

updateReadmeSection("THROUGHPUT", table);
