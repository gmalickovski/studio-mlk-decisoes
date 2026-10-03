import { test } from "node:test";
import assert from "node:assert/strict";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { createApp } from "../src/http-server.js";
import { loadConfig, EMPTY_CONFIG } from "../src/config.js";
import { readFileSync } from "node:fs";

const cleanEnv = Object.fromEntries(
  Object.entries(process.env).filter(([k]) => !k.startsWith("DECISION_")),
);

test("example config is empty", () => {
  const example = JSON.parse(readFileSync("config/decision.example.json", "utf8"));
  assert.deepEqual(example, { routes: [], thresholds: {}, rules: [] });
  assert.deepEqual(loadConfig("does-not-exist.json"), EMPTY_CONFIG);
});

test("HTTP service boots without any key and answers undecided", async () => {
  const server = createApp(EMPTY_CONFIG);
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const health = await (await fetch(`${base}/health`)).json();
    assert.equal(health.status, "ok");
    assert.equal(health.provider.configured, false);

    const res = await fetch(`${base}/decide`, { method: "POST", body: JSON.stringify({ a: 1 }) });
    const body = await res.json();
    assert.equal(body.decision, "undecided");

    assert.equal((await fetch(`${base}/anything-else`, { method: "POST" })).status, 404);
  } finally {
    server.close();
  }
});

test("MCP server lists and serves the decide tool over stdio", async () => {
  const client = new Client({ name: "test", version: "0.0.0" });
  await client.connect(
    new StdioClientTransport({ command: "node", args: ["src/mcp-server.js"], env: cleanEnv }),
  );
  try {
    const { tools } = await client.listTools();
    assert.deepEqual(tools.map((t) => t.name).sort(), ["decide", "status"]);
    const result = await client.callTool({ name: "decide", arguments: { input: { x: 1 } } });
    assert.equal(JSON.parse(result.content[0].text).decision, "undecided");
  } finally {
    await client.close();
  }
});
