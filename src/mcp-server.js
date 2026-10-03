#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { pathToFileURL } from "node:url";
import { z } from "zod";
import { loadConfig } from "./config.js";
import { decide } from "./decide.js";
import { providerStatus } from "./provider.js";

export function createMcpServer(config = loadConfig()) {
  const server = new McpServer({ name: "decision-service", version: "0.1.0" });

  server.registerTool(
    "decide",
    {
      description: "Ask the decision service for a decision about the given input.",
      inputSchema: { input: z.record(z.string(), z.unknown()).default({}) },
    },
    async ({ input }) => ({
      content: [{ type: "text", text: JSON.stringify(decide(input, config)) }],
    }),
  );

  server.registerTool(
    "status",
    { description: "Report whether the service is running and a provider is configured." },
    async () => ({
      content: [{ type: "text", text: JSON.stringify({ status: "ok", provider: providerStatus() }) }],
    }),
  );

  return server;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  await createMcpServer().connect(new StdioServerTransport());
}
