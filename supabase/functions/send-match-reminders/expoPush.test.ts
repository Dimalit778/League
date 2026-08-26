import {
  buildExpoMessages,
  chunkMessages,
  invalidTokensFromTickets,
  type ExpoMessage,
  type MatchForPush,
  type Recipient,
} from './expoPush.ts';

const assertEquals = (actual: unknown, expected: unknown) => {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) throw new Error(`Expected ${e}, received ${a}`);
};

const match: MatchForPush = {
  id: 42,
  leagueId: 'league-1',
  competitionId: 2021,
  homeName: 'Arsenal',
  awayName: 'Chelsea',
};

Deno.test('buildExpoMessages: one message per recipient with match data', () => {
  const recipients: Recipient[] = [
    { userId: 'u1', token: 'ExponentPushToken[a]' },
    { userId: 'u2', token: 'ExponentPushToken[b]' },
  ];
  const messages = buildExpoMessages(match, recipients);
  assertEquals(messages.length, 2);
  assertEquals(messages[0], {
    to: 'ExponentPushToken[a]',
    title: 'Match starts soon',
    body: 'Arsenal vs Chelsea',
    sound: 'default',
    data: { type: 'match-reminder', matchId: 42, leagueId: 'league-1', competitionId: 2021 },
  });
});

Deno.test('chunkMessages: splits into batches of at most 100', () => {
  const messages = Array.from({ length: 250 }, (_, i) => ({ to: `t${i}` })) as ExpoMessage[];
  const chunks = chunkMessages(messages);
  assertEquals(chunks.length, 3);
  assertEquals(chunks[0].length, 100);
  assertEquals(chunks[2].length, 50);
});

Deno.test('invalidTokensFromTickets: returns DeviceNotRegistered tokens', () => {
  const messages = [
    { to: 'ExponentPushToken[a]' },
    { to: 'ExponentPushToken[b]' },
    { to: 'ExponentPushToken[c]' },
  ] as ExpoMessage[];
  const tickets = [
    { status: 'ok', id: '1' },
    { status: 'error', details: { error: 'DeviceNotRegistered' } },
    { status: 'error', details: { error: 'MessageTooBig' } },
  ] as const;
  const invalid = invalidTokensFromTickets(messages, tickets as never);
  assertEquals(invalid, ['ExponentPushToken[b]']);
});
