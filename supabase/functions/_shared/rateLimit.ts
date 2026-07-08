// Pure helpers for football-API rate limiting and retry policy.
// No Deno/runtime APIs here so the logic is unit-testable from the app's
// jest setup (supabase/functions is excluded from the app tsconfig, but
// jest transforms this file fine).

export const FOOTBALL_API_LIMIT_PER_MINUTE = 10;

// How long to wait after a 429. Prefers the Retry-After header (seconds),
// clamped to [1s, maxMs]; falls back to a full budget window.
export const parseRetryAfterMs = (retryAfterHeader: string | null, maxMs = 65_000): number => {
  const fallback = 61_000;
  if (!retryAfterHeader) return Math.min(fallback, maxMs);

  const seconds = Number(retryAfterHeader);
  if (!Number.isFinite(seconds) || seconds <= 0) return Math.min(fallback, maxMs);

  return Math.min(Math.max(seconds * 1000, 1000), maxMs);
};

// Only transient server errors are worth retrying. 429 is handled separately
// (single Retry-After wait), and 4xx are permanent for a given request.
export const isRetryableStatus = (status: number): boolean => status >= 500 && status < 600;

export const backoffDelayMs = (attempt: number, baseMs = 500): number => baseMs * 2 ** attempt;

// Milliseconds until just past the next rolling-window slot opens up.
// Used when the DB budget is exhausted: waiting ~a window guarantees room.
export const budgetRetryDelayMs = (nowMs: number, windowMs = 60_000): number => {
  const intoWindow = nowMs % windowMs;
  return windowMs - intoWindow + 1000;
};
