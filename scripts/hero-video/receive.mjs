// Receives JPEG frames from /dev/hero-capture and writes them to an output folder.
// Usage: node scripts/hero-video/receive.mjs <outDir> [port]
import { createServer } from "node:http";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const outDir = process.argv[2];
const port = Number(process.argv[3] ?? 3199);
if (!outDir) {
  console.error("usage: receive.mjs <outDir> [port]");
  process.exit(1);
}
mkdirSync(outDir, { recursive: true });

createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Allow-Private-Network", "true");
  if (req.method === "OPTIONS") return res.end();
  const url = new URL(req.url, "http://localhost");
  if (req.method !== "POST" || url.pathname !== "/frame") return res.writeHead(404).end();
  const chunks = [];
  req.on("data", (c) => chunks.push(c));
  req.on("end", () => {
    const i = Number(url.searchParams.get("i"));
    writeFileSync(join(outDir, `f${String(i).padStart(4, "0")}.jpg`), Buffer.concat(chunks));
    res.end("ok");
  });
}).listen(port, () => console.log(`receiving frames on :${port} into ${outDir}`));
