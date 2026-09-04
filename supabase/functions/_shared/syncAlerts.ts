// Deduplicated operational alerts for sync jobs. Diagnostic payloads are kept
// intentionally small before they leave Supabase for Sentry.
// deno-lint-ignore-file no-explicit-any
import {
  captureOperationalAlert,
  logException,
  logStructured,
} from "./monitoring.ts";

export const SYNC_ALERT_COOLDOWN_MS = 30 * 60 * 1_000;
export type SyncAlertStatus = "error" | "partial" | "stale";

export type SyncFailureAlert = {
  job: string;
  status: SyncAlertStatus;
  message: string;
  httpStatus?: number;
  errorName?: string;
  errorCode?: string;
  updated?: number;
  totalFetched?: number;
  rejected?: number;
  upsertErrors?: number;
};

export const shouldSendSyncAlert = (
  lastAlertedAt: string | null,
  lastAlertStatus: string | null,
  nextStatus: SyncAlertStatus,
  nowMs = Date.now(),
  cooldownMs = SYNC_ALERT_COOLDOWN_MS,
) => {
  if (lastAlertStatus !== nextStatus || !lastAlertedAt) return true;
  const lastMs = Date.parse(lastAlertedAt);
  return !Number.isFinite(lastMs) || nowMs - lastMs >= cooldownMs;
};

export const clearSyncFailureAlert = async (supabase: any, job: string) => {
  const { error } = await supabase
    .from("sync_locks")
    .update({ last_alerted_at: null, last_alert_status: null })
    .eq("job", job);
  if (error) {
    logException(job, error, { operation: "sync_locks.clear_alert_state" });
  }
};

export const sendSyncFailureAlert = async (
  supabase: any,
  alert: SyncFailureAlert,
): Promise<boolean> => {
  try {
    const { data: lock, error: lockError } = await supabase
      .from("sync_locks")
      .select("last_alerted_at,last_alert_status")
      .eq("job", alert.job)
      .maybeSingle();
    if (lockError) throw lockError;

    if (
      !shouldSendSyncAlert(
        lock?.last_alerted_at ?? null,
        lock?.last_alert_status ?? null,
        alert.status,
      )
    ) {
      logStructured("info", "sync.alert_suppressed", {
        function: alert.job,
        syncStatus: alert.status,
      });
      return false;
    }

    const delivered = await captureOperationalAlert(
      alert.job,
      alert.message,
      {
        syncStatus: alert.status,
        status: alert.httpStatus,
        errorName: alert.errorName,
        errorCode: alert.errorCode,
        updated: alert.updated,
        totalFetched: alert.totalFetched,
        rejected: alert.rejected,
        upsertErrors: alert.upsertErrors,
      },
    );
    if (!delivered) return false;

    const { error: updateError } = await supabase
      .from("sync_locks")
      .update({
        last_alerted_at: new Date().toISOString(),
        last_alert_status: alert.status,
      })
      .eq("job", alert.job);
    if (updateError) throw updateError;

    return true;
  } catch (error) {
    logException(alert.job, error, {
      operation: "sync_failure_sentry_alert",
      syncStatus: alert.status,
    });
    return false;
  }
};
