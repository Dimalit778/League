import { captureOperationalAlert, describeError } from "./monitoring.ts";

const assertEquals = (actual: unknown, expected: unknown) => {
  if (actual !== expected) {
    throw new Error(`Expected ${String(expected)}, received ${String(actual)}`);
  }
};

const assertStringIncludes = (actual: string, expected: string) => {
  if (!actual.includes(expected)) {
    throw new Error(`Expected ${actual} to include ${expected}`);
  }
};

Deno.test("describeError preserves PostgREST error fields", () => {
  const details = describeError({
    code: "22P02",
    message:
      'invalid input value for enum match_status: "2026-09-04 18:00:00Z"',
    details: "Bad row contains ...",
    hint: "Check the status mapping",
  });

  assertEquals(details.errorCode, "22P02");
  assertStringIncludes(details.errorMessage, "invalid input value");
  assertEquals(details.errorDetails, "Bad row contains ...");
  assertEquals(details.errorHint, "Check the status mapping");
});

Deno.test("captureOperationalAlert sends a minimal grouped Sentry event", async () => {
  const originalFetch = globalThis.fetch;
  let requestUrl = "";
  let requestBody = "";
  globalThis.fetch = ((input: string | URL | Request, init?: RequestInit) => {
    requestUrl = String(input);
    requestBody = String(init?.body ?? "");
    return Promise.resolve(new Response(null, { status: 200 }));
  }) as typeof fetch;

  try {
    const delivered = await captureOperationalAlert(
      "sync-today-matches",
      "Database update failed",
      { syncStatus: "error", status: 500 },
    );
    assertEquals(delivered, true);
    assertStringIncludes(
      requestUrl,
      "ingest.de.sentry.io/api/4510343191265360/store/",
    );
    assertStringIncludes(
      requestBody,
      '"fingerprint":["sync-today-matches","error"]',
    );
    assertStringIncludes(requestBody, '"value":"Database update failed"');
    assertEquals(requestBody.includes("errorStack"), false);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
