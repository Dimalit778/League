import { shouldSendSyncAlert, SYNC_ALERT_COOLDOWN_MS } from "./syncAlerts.ts";

const assertEquals = (actual: unknown, expected: unknown) => {
  if (actual !== expected) {
    throw new Error(`Expected ${String(expected)}, received ${String(actual)}`);
  }
};

Deno.test("shouldSendSyncAlert sends the first alert", () => {
  assertEquals(shouldSendSyncAlert(null, null, "error", 1_000), true);
});

Deno.test("shouldSendSyncAlert suppresses the same status during cooldown", () => {
  const now = Date.parse("2026-09-04T20:00:00.000Z");
  const fiveMinutesAgo = new Date(now - 5 * 60_000).toISOString();
  assertEquals(
    shouldSendSyncAlert(fiveMinutesAgo, "error", "error", now),
    false,
  );
});

Deno.test("shouldSendSyncAlert sends after cooldown or status change", () => {
  const now = Date.parse("2026-09-04T20:00:00.000Z");
  const expired = new Date(now - SYNC_ALERT_COOLDOWN_MS).toISOString();
  assertEquals(shouldSendSyncAlert(expired, "error", "error", now), true);
  assertEquals(
    shouldSendSyncAlert(new Date(now).toISOString(), "error", "stale", now),
    true,
  );
});
