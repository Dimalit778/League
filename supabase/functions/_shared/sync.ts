// Shared runtime helpers for the football sync Edge Functions.
//
// Every function that talks to football-data.org MUST go through fdFetch():
// it reserves budget from the DB-backed rolling 10-calls/minute limiter
// before each request, so the external limit cannot be exceeded even when
// multiple functions, cron overlaps, or manual triggers run concurrently.
//
// deno-lint-ignore-file no-explicit-any
import { createClient } from "npm:@supabase/supabase-js@2.75.0";
import {
  backoffDelayMs,
  budgetRetryDelayMs,
  FOOTBALL_API_LIMIT_PER_MINUTE,
  isRetryableStatus,
  parseRetryAfterMs,
} from "./rateLimit.ts";
import { createRequestId, logException, logStructured, monitoredErrorResponse } from "./monitoring.ts";

export const FD_BASE = "https://api.football-data.org/v4";

const FETCH_TIMEOUT_MS = 20_000;
const MAX_5XX_RETRIES = 2;
const MAX_NETWORK_RETRIES = 2;
const MAX_BUDGET_WAITS = 2;

export const JSON_HEADERS = { "Content-Type": "application/json" };

export const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });

export const must = (key: string): string => {
  const v = Deno.env.get(key);
  if (!v) throw new Error(`${key} is not set`);
  return v;
};

export const nowIso = () => new Date().toISOString();

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const createServiceClient = () =>
  createClient(must("SUPABASE_URL"), must("SUPABASE_SERVICE_ROLE_KEY"));

// ── Authorization ────────────────────────────────────────────────────────────
// Sync functions are cron/admin-only. Callers must present the shared secret
// (x-sync-secret header) or the service-role key as a Bearer token. The mobile
// app must never call these — it reads synced data from the DB instead.
export const requireSyncAuth = (req: Request): Response | null => {
  const secret = Deno.env.get("SYNC_SECRET");
  const provided = req.headers.get("x-sync-secret");
  if (secret && provided === secret) return null;

  const bearer = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
  if (bearer && bearer === Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")) return null;

  const requestId = createRequestId(req);
  logStructured("warning", "function.auth_rejected", {
    requestId,
    path: new URL(req.url).pathname,
    status: 401,
  });
  return new Response(JSON.stringify({ success: false, requestId, message: "Unauthorized" }), {
    status: 401,
    headers: { ...JSON_HEADERS, "x-error-id": requestId },
  });
};

// ── Overlap guard ────────────────────────────────────────────────────────────
export const tryAcquireSyncLock = async (
  supabase: any,
  job: string,
  leaseSeconds = 300,
): Promise<boolean> => {
  const { data, error } = await supabase.rpc("try_acquire_sync_lock", {
    p_job: job,
    p_lease_seconds: leaseSeconds,
  });
  if (error) throw new Error(`try_acquire_sync_lock failed: ${error.message}`);
  return data === true;
};

export const releaseSyncLock = async (supabase: any, job: string, status: string) => {
  const { error } = await supabase.rpc("release_sync_lock", { p_job: job, p_status: status });
  if (error) logException(job, error, { operation: "release_sync_lock", syncStatus: status });
};

export const lockedResponse = (job: string) => {
  console.info(`${job}: another run holds the sync lock — skipping`);
  return jsonResponse({ success: true, skipped: true, message: `${job} is already running` });
};

// ── Budget-aware football-data.org fetch ─────────────────────────────────────
class BudgetExhaustedError extends Error {
  constructor(job: string) {
    super(`football API budget exhausted (job: ${job})`);
  }
}

const consumeBudget = async (supabase: any, job: string): Promise<void> => {
  for (let waits = 0; ; waits++) {
    const { data, error } = await supabase.rpc("consume_football_api_budget", {
      p_calls: 1,
      p_job: job,
      p_limit: FOOTBALL_API_LIMIT_PER_MINUTE,
    });
    if (error) throw new Error(`consume_football_api_budget failed: ${error.message}`);
    if (data === true) return;

    if (waits >= MAX_BUDGET_WAITS) throw new BudgetExhaustedError(job);
    const delay = budgetRetryDelayMs(Date.now());
    console.warn(`${job}: football API budget exhausted, waiting ${delay}ms`);
    await sleep(delay);
  }
};

// One rate-limited call to football-data.org. Sequential use only — callers
// must NOT run fdFetch in Promise.all over many URLs.
export const fdFetch = async (supabase: any, job: string, url: string, fdKey: string): Promise<any> => {
  let attempt5xx = 0;
  let networkRetries = 0;
  let handled429 = false;

  while (true) {
    await consumeBudget(supabase, job);

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
    let res: Response;
    try {
      res = await fetch(url, {
        headers: { "X-Auth-Token": fdKey, Accept: "application/json" },
        signal: ctrl.signal,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (networkRetries < MAX_NETWORK_RETRIES) {
        const delay = backoffDelayMs(networkRetries++);
        console.warn(`${job}: FD API network failure (${message}), retrying in ${delay}ms`);
        await sleep(delay);
        continue;
      }

      throw new Error(`FD API network failure after ${networkRetries + 1} attempts: ${message}`);
    } finally {
      clearTimeout(timer);
    }

    if (res.ok) return res.json();

    const bodyText = await res.text().catch(() => "");

    if (res.status === 429) {
      // Respect Retry-After once; a second 429 means we must stop, not hammer.
      if (handled429) throw new Error(`FD API rate limited twice (429): ${url}`);
      handled429 = true;
      const wait = parseRetryAfterMs(res.headers.get("Retry-After"));
      console.warn(`${job}: FD API 429, honouring Retry-After (${wait}ms) for ${url}`);
      await sleep(wait);
      continue;
    }

    if (isRetryableStatus(res.status) && attempt5xx < MAX_5XX_RETRIES) {
      const delay = backoffDelayMs(attempt5xx++);
      console.warn(`${job}: FD API ${res.status}, retrying in ${delay}ms`);
      await sleep(delay);
      continue;
    }

    throw new Error(`FD API ${res.status}: ${bodyText.slice(0, 300)}`);
  }
};

// ── Common error response ────────────────────────────────────────────────────
export const errorResponse = (tag: string, err: unknown) => {
  const status = err instanceof BudgetExhaustedError ? 429 : 500;
  return monitoredErrorResponse(tag, err, status);
};
