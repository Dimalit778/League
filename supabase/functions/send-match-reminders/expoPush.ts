export type Recipient = { userId: string; token: string };

export type MatchForPush = {
  id: number;
  leagueId: string | null;
  competitionId: number;
  homeName: string;
  awayName: string;
};

export type ExpoMessage = {
  to: string;
  title: string;
  body: string;
  sound: 'default';
  data: {
    type: 'match-reminder';
    matchId: number;
    leagueId: string | null;
    competitionId: number;
  };
};

export type ExpoTicket = {
  status: 'ok' | 'error';
  id?: string;
  details?: { error?: string };
};

export const buildExpoMessages = (match: MatchForPush, recipients: Recipient[]): ExpoMessage[] =>
  recipients.map((recipient) => ({
    to: recipient.token,
    title: 'Match starts soon',
    body: `${match.homeName} vs ${match.awayName}`,
    sound: 'default',
    data: {
      type: 'match-reminder',
      matchId: match.id,
      leagueId: match.leagueId,
      competitionId: match.competitionId,
    },
  }));

export const chunkMessages = (messages: ExpoMessage[], size = 100): ExpoMessage[][] => {
  const chunks: ExpoMessage[][] = [];
  for (let i = 0; i < messages.length; i += size) {
    chunks.push(messages.slice(i, i + size));
  }
  return chunks;
};

export const invalidTokensFromTickets = (messages: ExpoMessage[], tickets: ExpoTicket[]): string[] => {
  const invalid: string[] = [];
  tickets.forEach((ticket, index) => {
    if (ticket.status === 'error' && ticket.details?.error === 'DeviceNotRegistered') {
      const message = messages[index];
      if (message) invalid.push(message.to);
    }
  });
  return invalid;
};
