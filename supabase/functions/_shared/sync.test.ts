import { fdFetch } from './sync.ts';

const assertEquals = (actual: unknown, expected: unknown) => {
  if (actual !== expected) {
    throw new Error(`Expected ${String(expected)}, received ${String(actual)}`);
  }
};

Deno.test('fdFetch retries a transient network failure', async () => {
  const originalFetch = globalThis.fetch;
  let fetchCalls = 0;
  let budgetCalls = 0;

  globalThis.fetch = (() => {
    fetchCalls += 1;
    if (fetchCalls === 1) return Promise.reject(new TypeError('temporary network failure'));

    return Promise.resolve(
      new Response(JSON.stringify({ matches: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
  }) as typeof fetch;

  const supabase = {
    rpc: () => {
      budgetCalls += 1;
      return Promise.resolve({ data: true, error: null });
    },
  };

  try {
    const result = await fdFetch(supabase, 'test-sync', 'https://example.test/matches', 'test-key');
    assertEquals(Array.isArray(result.matches), true);
    assertEquals(fetchCalls, 2);
    assertEquals(budgetCalls, 2);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
