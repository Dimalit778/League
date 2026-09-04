// Monitors sync-today-matches independently so a missing/stuck invocation can
// still notify administrators.
// deno-lint-ignore-file no-explicit-any
import {
  createServiceClient,
  jsonResponse,
  requireSyncAuth,
} from "../_shared/sync.ts";
import { monitoredErrorResponse } from "../_shared/monitoring.ts";
import {
  clearSyncFailureAlert,
  sendSyncFailureAlert,
  type SyncAlertStatus,
} from "../_shared/syncAlerts.ts";

const JOB = "sync-today-matches";
const STALE_AFTER_MS = 10 * 60 * 1_000;

Deno.serve(async (req) => {
  const denied = requireSyncAuth(req);
  if (denied) return denied;

  try {
    const supabase = createServiceClient();
    const { data: lock, error } = await supabase
      .from("sync_locks")
      .select("last_status,last_finished_at")
      .eq("job", JOB)
      .maybeSingle();
    if (error) throw error;

    const finishedMs = Date.parse(lock?.last_finished_at ?? "");
    const stale = !Number.isFinite(finishedMs) ||
      Date.now() - finishedMs > STALE_AFTER_MS;
    const healthy = !stale && lock?.last_status === "success";
    if (healthy) {
      await clearSyncFailureAlert(supabase, JOB);
      return jsonResponse({ success: true, status: "success" });
    }

    const status: SyncAlertStatus = stale
      ? "stale"
      : lock?.last_status === "partial"
      ? "partial"
      : "error";
    const alerted = await sendSyncFailureAlert(supabase, {
      job: JOB,
      status,
      message: stale
        ? "sync-today-matches has not completed in the last 10 minutes"
        : `sync-today-matches last finished with status ${
          String(lock?.last_status)
        }`,
      httpStatus: 503,
    });
    return jsonResponse({ success: false, status, alerted }, 503);
  } catch (error) {
    return monitoredErrorResponse("monitor-sync-health", error);
  }
});
