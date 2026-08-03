import { createClient, type User } from 'npm:@supabase/supabase-js@2';
import { importPKCS8, SignJWT } from 'npm:jose@5.9.6';
import { createRequestId, monitoredErrorResponse } from '../_shared/monitoring.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
const REVENUECAT_SECRET_API_KEY = Deno.env.get('REVENUECAT_SECRET_API_KEY') ?? '';
const PROFILE_IMAGES_BUCKET = Deno.env.get('PROFILE_IMAGES_BUCKET') ?? 'profile_images';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

type DeleteAccountBody = {
  appleAuthorizationCode?: string | null;
};

function isAppleUser(user: User) {
  const providers = user.app_metadata?.providers;

  return (
    user.identities?.some((identity) => identity.provider === 'apple') === true ||
    user.app_metadata?.provider === 'apple' ||
    (Array.isArray(providers) && providers.includes('apple'))
  );
}

async function createAppleClientSecret() {
  const clientId = Deno.env.get('APPLE_CLIENT_ID') ?? '';
  const teamId = Deno.env.get('APPLE_TEAM_ID') ?? '';
  const keyId = Deno.env.get('APPLE_KEY_ID') ?? '';
  const privateKey = (Deno.env.get('APPLE_PRIVATE_KEY') ?? '').replace(/\\n/g, '\n');

  if (!clientId || !teamId || !keyId || !privateKey) {
    throw new Error('Sign in with Apple revocation is not configured');
  }

  const signingKey = await importPKCS8(privateKey, 'ES256');
  const clientSecret = await new SignJWT({})
    .setProtectedHeader({ alg: 'ES256', kid: keyId })
    .setIssuer(teamId)
    .setSubject(clientId)
    .setAudience('https://appleid.apple.com')
    .setIssuedAt()
    .setExpirationTime('5m')
    .sign(signingKey);

  return { clientId, clientSecret };
}

async function revokeAppleAuthorization(authorizationCode: string) {
  const { clientId, clientSecret } = await createAppleClientSecret();
  const tokenResponse = await fetch('https://appleid.apple.com/auth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code: authorizationCode,
      grant_type: 'authorization_code',
    }),
  });

  if (!tokenResponse.ok) {
    throw new Error(`Apple token exchange failed (${tokenResponse.status})`);
  }

  const tokens = (await tokenResponse.json()) as {
    access_token?: string;
    refresh_token?: string;
  };
  const token = tokens.refresh_token ?? tokens.access_token;

  if (!token) {
    throw new Error('Apple token exchange returned no revocable token');
  }

  const revokeResponse = await fetch('https://appleid.apple.com/auth/revoke', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      token,
      token_type_hint: tokens.refresh_token ? 'refresh_token' : 'access_token',
    }),
  });

  if (!revokeResponse.ok) {
    throw new Error(`Apple authorization revocation failed (${revokeResponse.status})`);
  }
}

async function deleteRevenueCatCustomer(appUserId: string) {
  if (!REVENUECAT_SECRET_API_KEY) {
    throw new Error('RevenueCat account deletion is not configured');
  }

  const response = await fetch(
    `https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(appUserId)}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${REVENUECAT_SECRET_API_KEY}`,
        'Content-Type': 'application/json',
      },
    },
  );

  // A retry after a partial deletion is expected to receive not found.
  if (!response.ok && response.status !== 404) {
    throw new Error(`RevenueCat customer deletion failed (${response.status})`);
  }
}

async function deleteProfileImages(userId: string) {
  const { data: memberships, error } = await adminClient
    .from('league_members')
    .select('id, avatar_url')
    .eq('user_id', userId);

  if (error) throw new Error(error.message);

  const storedPaths = new Set<string>();
  for (const membership of memberships ?? []) {
    if (membership.avatar_url && !membership.avatar_url.includes('://')) {
      storedPaths.add(membership.avatar_url);
    }
  }

  // Older uploads use a member-id filename. Listing by prefix also removes
  // superseded/orphaned profile images that are no longer referenced by a row.
  for (const membership of memberships ?? []) {
    const { data: files, error: listError } = await adminClient.storage
      .from(PROFILE_IMAGES_BUCKET)
      .list('', { search: `${membership.id}_`, limit: 100 });

    if (listError) throw new Error(listError.message);
    for (const file of files ?? []) storedPaths.add(file.name);
  }

  if (storedPaths.size === 0) return 0;

  const { error: storageError } = await adminClient.storage
    .from(PROFILE_IMAGES_BUCKET)
    .remove([...storedPaths]);

  if (storageError) throw new Error(storageError.message);
  return storedPaths.size;
}

Deno.serve(async (req) => {
  const requestId = createRequestId(req);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return json({ error: 'Method not allowed' }, 405);
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return json({ error: 'Missing authorization header' }, 401);

    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();

    if (userError || !user) return json({ error: 'Unauthorized' }, 401);

    const body = (await req.json().catch(() => ({}))) as DeleteAccountBody;
    if (isAppleUser(user)) {
      if (!body.appleAuthorizationCode) {
        return json({ error: 'Apple reauthentication is required' }, 400);
      }
      await revokeAppleAuthorization(body.appleAuthorizationCode);
    }

    const { data: subscription, error: subscriptionError } = await adminClient
      .from('user_subscriptions')
      .select('revenuecat_app_user_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (subscriptionError) throw new Error(subscriptionError.message);

    const revenueCatAppUserId = subscription?.revenuecat_app_user_id ?? user.id;
    await deleteRevenueCatCustomer(revenueCatAppUserId);
    const deletedProfileImages = await deleteProfileImages(user.id);

    const { data: anonymization, error: anonymizationError } = await adminClient.rpc(
      'anonymize_user_account',
      {
        p_user_id: user.id,
        p_revenuecat_app_user_id: revenueCatAppUserId,
      },
    );

    if (anonymizationError) throw new Error(anonymizationError.message);

    const { error: authError } = await adminClient.auth.admin.deleteUser(user.id);
    if (authError) throw new Error(authError.message);

    return json({ success: true, deletedProfileImages, anonymization });
  } catch (err) {
    return monitoredErrorResponse('delete-account', err, 500, requestId);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
