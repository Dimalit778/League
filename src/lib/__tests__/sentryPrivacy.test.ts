import { scrubSentryEvent } from '../sentryPrivacy';

describe('scrubSentryEvent', () => {
  it('removes identity, request payloads, query strings, and breadcrumb data', () => {
    const event = {
      user: { email: 'person@example.com' },
      request: {
        url: 'https://example.com/path?email=person@example.com#private',
        headers: { authorization: 'secret' },
        cookies: { session: 'secret' },
        data: { nickname: 'private' },
        query_string: 'email=person@example.com',
      },
      breadcrumbs: [{ data: { memberId: 'private' } }],
      extra: { requestId: 'safe', accessToken: 'secret', email: 'person@example.com' },
    };

    expect(scrubSentryEvent(event)).toEqual({
      request: { url: 'https://example.com/path' },
      breadcrumbs: [{}],
      extra: { requestId: 'safe' },
    });
  });
});
