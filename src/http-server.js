#!/usr/bin/env node
import { createServer } from "node:http";
import { pathToFileURL } from "node:url";
import { loadConfig } from "./config.js";
import { decide } from "./decide.js";
import { providerStatus } from "./provider.js";

const MAX_BODY_BYTES = 64 * 1024;

function send(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, { "content-type": "application/json" });
  res.end(payload);
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(Object.assign(new Error("body too large"), { status: 413 }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}"));
      } catch {
        reject(Object.assign(new Error("invalid JSON"), { status: 400 }));
      }
    });
    req.on("error", reject);
  });
}

export function createApp(config = loadConfig()) {
  return createServer(async (req, res) => {
    const { pathname } = new URL(req.url, "http://localhost");

    if (req.method === "GET" && pathname === "/health") {
      return send(res, 200, { status: "ok", provider: providerStatus() });
    }

    if (req.method === "POST" && pathname === "/decide") {
      try {
        const input = await readJson(req);
        return send(res, 200, decide(input, config));
      } catch (err) {
        return send(res, err.status ?? 500, { error: err.message });
      }
    }

    return send(res, 404, { error: "not found" });
  });
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const host = process.env.HOST || "127.0.0.1";
  const port = Number(process.env.PORT || 8787);
  createApp().listen(port, host, () => {
    console.error(`decision-service listening on http://${host}:${port}`);
  });
}
