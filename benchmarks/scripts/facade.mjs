/**
 * Facade throughput benchmark (requires a live Redis server on 127.0.0.1:6379).
 *
 * Compares repeated Redis.get/set calls. Baseline (0.1.46) disconnects and recreates
 * the client after every operation; the optimized build keeps a persistent connection
 * and reuses it across operations.
 *
 * Run: bun run scripts/facade.mjs
 */
import {spawnSync} from "node:child_process";
import {fileURLToPath} from "node:url";
import path from "node:path";
import {printTable} from "./table-format.mjs";
import {updateReadmeSection} from "./readme-writer.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TRIALS = 7;
const runtime = process.execPath;

function runTrials(scriptPath) {
    const results = [];
    for (let i = 0; i < TRIALS; i++) {
        const res = spawnSync(runtime, [scriptPath], {encoding: "utf8"});
        if (res.status !== 0) {
            console.error("Benchmark failed:", res.stderr);
            process.exit(1);
        }
        const match = res.stdout.match(/\{.*\}/s);
        if (!match) {
            console.error("No JSON result in stdout:", res.stdout);
            process.exit(1);
        }
        results.push(JSON.parse(match[0]));
    }
    return results;
}

function medKey(arr, key) {
    const sorted = arr.map((r) => r[key]).sort((a, b) => a - b);
    return sorted[Math.floor(sorted.length / 2)];
}

const ITERATIONS = 500;
const base = runTrials(path.join(__dirname, "facade-baseline.mjs"));
const opt = runTrials(path.join(__dirname, "facade-optimized.mjs"));

const bSet = medKey(base, "setMs");
const oSet = medKey(opt, "setMs");
const bGet = medKey(base, "getMs");
const oGet = medKey(opt, "getMs");

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
    title: "FACADE THROUGHPUT (live Redis)",
    subtitle: `${ITERATIONS.toLocaleString()} calls each, ${TRIALS} runs (median)`,
    headers: ["Method", "Baseline (0.1.46)", "Optimized", "Speedup", "Optimized ops/s"],
    rows: [
        {cells: ["Redis.set()", fmt(bSet), fmt(oSet), sp(bSet, oSet), ops(oSet)]},
        {cells: ["Redis.get()", fmt(bGet), fmt(oGet), sp(bGet, oGet), ops(oGet)]}
    ]
});

const table = [
    "| Method | baseline (0.1.46) | optimized | speedup | baseline ops/s | optimized ops/s |",
    "|---|---|---|---|---|---|",
    `| \`Redis.set()\` | ${bSet.toFixed(1)}ms | ${oSet.toFixed(1)}ms | **${(bSet / oSet).toFixed(2)}x** | ${ops(bSet)} | ${ops(oSet)} |`,
    `| \`Redis.get()\` | ${bGet.toFixed(1)}ms | ${oGet.toFixed(1)}ms | **${(bGet / oGet).toFixed(2)}x** | ${ops(bGet)} | ${ops(oGet)} |`
].join("\n");

updateReadmeSection("FACADE", table);
