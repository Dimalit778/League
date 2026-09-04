// Lightweight structured logging + Sentry reporting for Supabase Edge Functions.
// Reporting is best-effort and must never make the function itself fail.

type LogLevel = "info" | "warning" | "error";

type MonitoringContext = Record<
  string,
  string | number | boolean | null | undefined
>;

type ErrorLike = {
  name?: unknown;
  message?: unknown;
  code?: unknown;
  details?: unknown;
  hint?: unknown;
  stack?: unknown;
  cause?: unknown;
};

const MAX_ERROR_FIELD_LENGTH = 4_000;
const CHAMPO_SENTRY_DSN =
  "https://014844ec8a09d0a4fac8a7fdbb0d17b1@o4510343122190336.ingest.de.sentry.io/4510343191265360";

const stringifyErrorField = (value: unknown): string | undefined => {
  if (value == null) return undefined;
  if (typeof value === "string") return value.slice(0, MAX_ERROR_FIELD_LENGTH);
  try {
    return JSON.stringify(value).slice(0, MAX_ERROR_FIELD_LENGTH);
  } catch {
    return String(value).slice(0, MAX_ERROR_FIELD_LENGTH);
  }
};

export const describeError = (value: unknown) => {
  const source = value && typeof value === "object" ? value as ErrorLike : {};
  const message = stringifyErrorField(source.message) ??
    stringifyErrorField(value) ?? "Unknown error";

  return {
    errorName: stringifyErrorField(source.name) ??
      (value instanceof Error ? value.name : "Error"),
    errorMessage: message,
    errorCode: stringifyErrorField(source.code),
    errorDetails: stringifyErrorField(source.details),
    errorHint: stringifyErrorField(source.hint),
    errorStack: stringifyErrorField(source.stack) ??
      (value instanceof Error ? value.stack : undefined),
    errorCause: stringifyErrorField(source.cause),
  };
};

const toError = (value: unknown) => {
  if (value instanceof Error) return value;
  const details = describeError(value);
  const error = new Error(details.errorMessage, { cause: value });
  error.name = details.errorName;
  return error;
};

export const createRequestId = (req?: Request) =>
  req?.headers.get("x-request-id")?.slice(0, 128) || crypto.randomUUID();

export const logStructured = (
  level: LogLevel,
  event: string,
  context: MonitoringContext = {},
) => {
  const payload = JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    event,
    ...context,
  });

  if (level === "error") console.error(payload);
  else if (level === "warning") console.warn(payload);
  else console.info(payload);
};

const sentryEndpoint = (dsnOverride?: string) => {
  const dsn = dsnOverride ?? Deno.env.get("SENTRY_DSN");
  if (!dsn) return null;

  try {
    const parsed = new URL(dsn);
    const projectId = parsed.pathname.replace(/^\//, "");
    if (!parsed.username || !projectId) return null;
    return `${parsed.protocol}//${parsed.host}/api/${projectId}/store/?sentry_key=${parsed.username}&sentry_version=7`;
  } catch {
    return null;
  }
};

export const captureOperationalAlert = async (
  tag: string,
  title: string,
  context: MonitoringContext = {},
) => {
  const endpoint = sentryEndpoint(CHAMPO_SENTRY_DSN);
  if (!endpoint) return false;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2_000);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event_id: crypto.randomUUID().replaceAll("-", ""),
        timestamp: new Date().toISOString(),
        platform: "javascript",
        level: "error",
        logger: "supabase-sync-monitor",
        environment: Deno.env.get("ENVIRONMENT") ?? "production",
        fingerprint: [tag, String(context.syncStatus ?? "error")],
        tags: { function: tag, source: "supabase-edge-function" },
        extra: context,
        exception: {
          values: [{ type: "SyncFailure", value: title.slice(0, 500) }],
        },
      }),
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(`Sentry delivery failed with status ${response.status}`);
    }
    logStructured("info", "monitoring.alert_delivered", { function: tag });
    return true;
  } catch (reportingError) {
    logStructured("warning", "monitoring.delivery_failed", {
      function: tag,
      message: toError(reportingError).message,
    });
    return false;
  } finally {
    clearTimeout(timeout);
  }
};

export const captureException = async (
  tag: string,
  value: unknown,
  context: MonitoringContext = {},
) => {
  const error = toError(value);
  const details = describeError(value);
  const endpoint = sentryEndpoint();
  if (!endpoint) return;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2_000);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event_id: crypto.randomUUID().replaceAll("-", ""),
        timestamp: new Date().toISOString(),
        platform: "javascript",
        level: "error",
        logger: "supabase-edge-function",
        environment: Deno.env.get("ENVIRONMENT") ?? "production",
        tags: { function: tag },
        extra: { ...context, ...details },
        exception: {
          values: [{ type: error.name, value: error.message }],
        },
      }),
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(`Sentry delivery failed with status ${response.status}`);
    }
  } catch (reportingError) {
    logStructured("warning", "monitoring.delivery_failed", {
      function: tag,
      message: toError(reportingError).message,
    });
  } finally {
    clearTimeout(timeout);
  }
};

export const logException = (
  tag: string,
  value: unknown,
  context: MonitoringContext = {},
) => {
  logStructured("error", "function.error", {
    function: tag,
    ...context,
    ...describeError(value),
  });
};

export const monitoredErrorResponse = async (
  tag: string,
  value: unknown,
  status = 500,
  requestId = createRequestId(),
) => {
  logException(tag, value, {
    requestId,
    status,
  });
  await captureException(tag, value, { requestId, status });

  const message = status === 429
    ? "Rate limit exceeded. Try again later."
    : "The request could not be completed.";
  return new Response(JSON.stringify({ success: false, requestId, message }), {
    status,
    headers: { "Content-Type": "application/json", "x-error-id": requestId },
  });
};
