import { readFileSync, existsSync } from "node:fs";

export const EMPTY_CONFIG = Object.freeze({
  routes: Object.freeze([]),
  thresholds: Object.freeze({}),
  rules: Object.freeze([]),
});

/**
 * Loads the decision config. A missing path or missing file yields the empty
 * config, so the service always boots with no rules defined.
 */
export function loadConfig(path = process.env.DECISION_CONFIG_PATH) {
  if (!path || !existsSync(path)) return EMPTY_CONFIG;
  const parsed = JSON.parse(readFileSync(path, "utf8"));
  return {
    routes: Array.isArray(parsed.routes) ? parsed.routes : [],
    thresholds: parsed.thresholds && typeof parsed.thresholds === "object" ? parsed.thresholds : {},
    rules: Array.isArray(parsed.rules) ? parsed.rules : [],
  };
}
