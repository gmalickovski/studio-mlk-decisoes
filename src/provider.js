/**
 * The decision provider is described only by two environment variables.
 * The key is read from the environment and is never logged or returned.
 */
export function providerSettings(env = process.env) {
  const baseUrl = env.DECISION_API_BASE_URL?.trim() || null;
  const apiKey = env.DECISION_API_KEY?.trim() || null;
  return { baseUrl, apiKey, configured: Boolean(baseUrl && apiKey) };
}

/** Safe to expose: reports whether a provider is set, never its values. */
export function providerStatus(env = process.env) {
  return { configured: providerSettings(env).configured };
}
