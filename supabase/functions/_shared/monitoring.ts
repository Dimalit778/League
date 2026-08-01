// Lightweight structured logging + Sentry reporting for Supabase Edge Functions.
// Reporting is best-effort and must never make the function itself fail.

type LogLevel = "info" | "warning" | "error";

type MonitoringContext = Record<string, string | number | boolean | null | undefined>;

const toError = (value: unknown) => value instanceof Error ? value : new Error(String(value));

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

const sentryEndpoint = () => {
  const dsn = Deno.env.get("SENTRY_DSN");
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

export const captureException = async (
  tag: string,
  value: unknown,
  context: MonitoringContext = {},
) => {
  const error = toError(value);
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
        extra: { ...context, stack: error.stack },
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

export const monitoredErrorResponse = async (
  tag: string,
  value: unknown,
  status = 500,
  requestId = createRequestId(),
) => {
  const error = toError(value);
  logStructured("error", "function.request_failed", {
    function: tag,
    requestId,
    status,
    message: error.message,
  });
  await captureException(tag, error, { requestId, status });

  const message = status === 429
    ? "Rate limit exceeded. Try again later."
    : "The request could not be completed.";
  return new Response(JSON.stringify({ success: false, requestId, message }), {
    status,
    headers: { "Content-Type": "application/json", "x-error-id": requestId },
  });
};
