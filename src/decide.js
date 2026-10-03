/**
 * Core entry point shared by the HTTP process and the MCP server.
 *
 * This is a skeleton: no business rules are defined, so every request is
 * answered as undecided. Rule evaluation and any provider call are added here
 * later, behind this one function.
 */
export function decide(input, config) {
  return {
    decision: "undecided",
    reason: "no rules configured",
    input,
    rulesEvaluated: config.rules.length,
  };
}
