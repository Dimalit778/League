import {
  inferStatusFromMalformedTimestamp,
  isMatchStatus,
  mapFootballMatches,
  retryRejectedMatchesById,
} from "./footballMatches.ts";

const assertEquals = (actual: unknown, expected: unknown) => {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(
      `Expected ${JSON.stringify(expected)}, received ${
        JSON.stringify(actual)
      }`,
    );
  }
};

Deno.test("isMatchStatus only accepts values supported by the Postgres enum", () => {
  assertEquals(isMatchStatus("TIMED"), true);
  assertEquals(isMatchStatus("FINISHED"), true);
  assertEquals(isMatchStatus("EXTRA_TIME"), true);
  assertEquals(isMatchStatus("PENALTY_SHOOTOUT"), true);
  assertEquals(isMatchStatus("SUSPENDED"), true);
  assertEquals(isMatchStatus("CANCELLED"), true);
  assertEquals(isMatchStatus("AWARDED"), true);
  assertEquals(isMatchStatus("2026-09-04 18:00:00Z"), false);
  assertEquals(isMatchStatus(null), false);
});

Deno.test("inferStatusFromMalformedTimestamp only infers from safe provider signals", () => {
  const base = {
    status: "2026-09-04 18:00:00Z",
    utcDate: "2026-09-04T19:00:00Z",
    score: {
      winner: null,
      duration: "REGULAR",
      fullTime: { home: null, away: null },
    },
  };

  assertEquals(
    inferStatusFromMalformedTimestamp(base, Date.parse("2026-09-04T18:30:00Z")),
    "TIMED",
  );
  assertEquals(
    inferStatusFromMalformedTimestamp(
      {
        ...base,
        minute: 32,
        score: { ...base.score, fullTime: { home: 1, away: 0 } },
      },
      Date.parse("2026-09-04T19:32:00Z"),
    ),
    "IN_PLAY",
  );
  assertEquals(
    inferStatusFromMalformedTimestamp(
      {
        ...base,
        score: {
          winner: "HOME_TEAM",
          duration: "REGULAR",
          fullTime: { home: 2, away: 0 },
        },
      },
      Date.parse("2026-09-04T21:00:00Z"),
    ),
    "FINISHED",
  );
  assertEquals(
    inferStatusFromMalformedTimestamp(base, Date.parse("2026-09-04T20:00:00Z")),
    null,
  );
  assertEquals(
    inferStatusFromMalformedTimestamp({ ...base, status: "BROKEN" }),
    null,
  );
});

Deno.test("mapFootballMatches rejects a date accidentally supplied as status", () => {
  const { rows, rejected } = mapFootballMatches([
    { id: 1, status: "TIMED", utcDate: "2026-09-04T18:00:00Z", score: {} },
    { id: 2, status: "2026-09-04 18:00:00Z", utcDate: "2026-09-04T20:00:00Z" },
  ], { updatedAt: "provider" });

  assertEquals(rows.length, 1);
  assertEquals(rows[0].status, "TIMED");
  assertEquals(rows[0].kick_off, "2026-09-04T18:00:00Z");
  assertEquals(rejected, [{
    id: 2,
    status: "2026-09-04 18:00:00Z",
    kickOff: "2026-09-04T20:00:00Z",
    reason: "invalid_match_status",
    signals: {},
  }]);
});

Deno.test("retryRejectedMatchesById recovers a malformed list item from its detail resource", async () => {
  const rejected = [{
    id: 564667,
    status: "2026-09-04 18:00:00Z",
    kickOff: "2026-09-04T19:00:00Z",
    reason: "invalid_match_status",
  }];

  const recovered = await retryRejectedMatchesById(
    "test-sync",
    rejected,
    { updatedAt: "provider" },
    async (matchId) => ({
      id: matchId,
      status: "TIMED",
      utcDate: "2026-09-04T19:00:00Z",
      score: {},
    }),
  );

  assertEquals(recovered.rejected, []);
  assertEquals(recovered.rows.length, 1);
  assertEquals(recovered.rows[0].id, 564667);
  assertEquals(recovered.rows[0].status, "TIMED");
});
