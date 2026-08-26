type SentryPrivacyEvent = {
  user?: unknown;
  request?: {
    url?: string;
    headers?: unknown;
    cookies?: unknown;
    data?: unknown;
    query_string?: unknown;
    env?: unknown;
  };
  breadcrumbs?: { data?: unknown }[];
  extra?: Record<string, unknown>;
};

const SENSITIVE_KEY = /(authorization|cookie|email|name|password|secret|token)/i;

const stripUrlDetails = (value?: string): string | undefined => {
  if (!value) return value;
  try {
    const url = new URL(value);
    url.search = '';
    url.hash = '';
    return url.toString();
  } catch {
    return value.split(/[?#]/, 1)[0];
  }
};

/** Apply a final privacy boundary before a diagnostic event leaves the app. */
export const scrubSentryEvent = <T extends SentryPrivacyEvent>(event: T): T => {
  delete event.user;

  if (event.request) {
    event.request.url = stripUrlDetails(event.request.url);
    delete event.request.headers;
    delete event.request.cookies;
    delete event.request.data;
    delete event.request.query_string;
    delete event.request.env;
  }

  for (const breadcrumb of event.breadcrumbs ?? []) delete breadcrumb.data;
  for (const key of Object.keys(event.extra ?? {})) {
    if (SENSITIVE_KEY.test(key)) delete event.extra?.[key];
  }

  return event;
};
