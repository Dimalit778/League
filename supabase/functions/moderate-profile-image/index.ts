import { createClient } from 'npm:@supabase/supabase-js@2.75.0';
import { createRequestId, logStructured, monitoredErrorResponse } from '../_shared/monitoring.ts';
import {
  decodeAndValidateProfileImage,
  PROFILE_IMAGE_EXTENSIONS,
  ProfileImageValidationError,
  type ProfileImageMimeType,
  normalizeProfileImageMimeType,
} from '../_shared/profileImageValidation.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
const PROFILE_IMAGES_BUCKET = Deno.env.get('PROFILE_IMAGES_BUCKET') ?? 'profile_images';
const GOOGLE_VISION_API_KEY = Deno.env.get('GOOGLE_VISION_API_KEY') ?? '';

const MODERATION_LIMIT_PER_MONTH = 950;

// Google SafeSearch likelihood scale, lowest -> highest.
const LIKELIHOOD_RANK: Record<string, number> = {
  UNKNOWN: 0,
  VERY_UNLIKELY: 1,
  UNLIKELY: 2,
  POSSIBLE: 3,
  LIKELY: 4,
  VERY_LIKELY: 5,
};

// Reject LIKELY and VERY_LIKELY results. Lower this to POSSIBLE (3) for a
// stricter policy if production review shows an acceptable false-positive rate.
const REJECT_AT_RANK = 4; // LIKELY
const CATEGORIES_CHECKED = ['adult', 'violence', 'racy', 'medical'] as const;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

type ModerateBody = {
  memberId?: string;
  base64?: string;
  contentType?: string;
};

type SafeSearchResult =
  | { flagged: false }
  | { flagged: true; category: string; likelihood: string };

async function runSafeSearch(base64: string, requestId: string): Promise<SafeSearchResult> {
  if (!GOOGLE_VISION_API_KEY) {
    // Fail closed: without moderation configured we must not accept the upload.
    throw new Error('Image moderation is not configured');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  let response: Response;
  try {
    response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_VISION_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requests: [
            {
              image: { content: base64 },
              features: [{ type: 'SAFE_SEARCH_DETECTION' }],
            },
          ],
        }),
        signal: controller.signal,
      },
    );
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    throw new Error(`Vision API request failed (${response.status})`);
  }

  const payload = (await response.json()) as {
    responses?: { safeSearchAnnotation?: Record<string, string>; error?: { message?: string } }[];
  };

  const first = payload.responses?.[0];
  if (first?.error?.message) {
    throw new Error(`Vision API error: ${first.error.message}`);
  }
  if (!first?.safeSearchAnnotation) {
    throw new Error('Vision API returned no SafeSearch annotation');
  }

  const annotation = first.safeSearchAnnotation;
  for (const category of CATEGORIES_CHECKED) {
    const likelihood = annotation[category] ?? 'UNKNOWN';
    if ((LIKELIHOOD_RANK[likelihood] ?? 0) >= REJECT_AT_RANK) {
      logStructured('warning', 'moderation.rejected', { requestId, category, likelihood });
      return { flagged: true, category, likelihood };
    }
  }

  return { flagged: false };
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

    const body = (await req.json().catch(() => ({}))) as ModerateBody;
    const { memberId, base64 } = body;

    if (typeof memberId !== 'string' || memberId.length === 0) {
      return json({ error: 'memberId is required' }, 400);
    }
    if (typeof base64 !== 'string' || base64.length === 0) {
      return json({ error: 'base64 image data is required' }, 400);
    }

    // Server-side size + type validation (never trust the client).
    const contentType = normalizeProfileImageMimeType(body.contentType);
    if (!contentType || !(contentType in PROFILE_IMAGE_EXTENSIONS)) {
      return json({ error: 'Profile image must be JPEG, PNG, or WebP' }, 415);
    }
    const safeContentType = contentType as ProfileImageMimeType;
    let bytes: Uint8Array;
    try {
      bytes = decodeAndValidateProfileImage(base64, safeContentType);
    } catch (error) {
      if (error instanceof ProfileImageValidationError) {
        return json({ error: error.message }, error.status);
      }
      throw error;
    }

    // Ownership check: the caller must own this league_member row.
    const { data: member, error: memberFetchError } = await adminClient
      .from('league_members')
      .select('id, user_id, avatar_url')
      .eq('id', memberId)
      .single();

    if (memberFetchError || !member) return json({ error: 'Member not found' }, 404);
    if (member.user_id !== user.id) return json({ error: 'Forbidden' }, 403);

    // Reserve one app-wide Google Vision call atomically. A reservation counts
    // even when Google returns an error because it may still be billable.
    const { data: budgetAvailable, error: budgetError } = await adminClient.rpc(
      'consume_profile_image_moderation_budget',
    );
    if (budgetError) throw new Error(`Could not reserve moderation budget: ${budgetError.message}`);
    if (!budgetAvailable) {
      logStructured('warning', 'moderation.monthly_limit_reached', {
        requestId,
        limit: MODERATION_LIMIT_PER_MONTH,
      });
      return json(
        {
          error: 'rate_limit_exceeded',
          message: 'The monthly image moderation limit has been reached. Please try again next month.',
        },
        429,
        { 'Retry-After': secondsUntilNextUtcMonth().toString() },
      );
    }

    // Moderate BEFORE the image is ever written to storage.
    const verdict = await runSafeSearch(base64, requestId);
    if (verdict.flagged) {
      return json(
        {
          error: 'rejected',
          reason: verdict.category,
          message: 'This image appears to violate our content guidelines and was not saved.',
        },
        422,
      );
    }

    // Clean -> upload with the service role.
    const timestamp = Date.now();
    const filePath = `${memberId}_${timestamp}.${PROFILE_IMAGE_EXTENSIONS[safeContentType]}`;
    const bucket = adminClient.storage.from(PROFILE_IMAGES_BUCKET);

    const { error: uploadError } = await bucket.upload(filePath, bytes, {
      contentType: safeContentType,
      upsert: false,
    });
    if (uploadError) throw new Error(uploadError.message);

    const { data: updated, error: updateError } = await adminClient
      .from('league_members')
      .update({ avatar_url: filePath })
      .eq('id', memberId)
      .select()
      .single();

    if (updateError) {
      await bucket.remove([filePath]);
      throw new Error(updateError.message);
    }

    if (member.avatar_url && member.avatar_url !== filePath && !member.avatar_url.includes('://')) {
      await bucket.remove([member.avatar_url]);
    }

    logStructured('info', 'moderation.accepted', { requestId, memberId });
    return json({ success: true, avatarPath: filePath, member: updated });
  } catch (err) {
    const response = await monitoredErrorResponse('moderate-profile-image', err, 500, requestId);
    for (const [name, value] of Object.entries(corsHeaders)) response.headers.set(name, value);
    response.headers.set('Cache-Control', 'no-store');
    return response;
  }
});

function secondsUntilNextUtcMonth(now = new Date()): number {
  const nextMonth = Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1);
  return Math.max(1, Math.ceil((nextMonth - now.getTime()) / 1000));
}

function json(data: unknown, status = 200, extraHeaders: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      ...extraHeaders,
      'Cache-Control': 'no-store',
      'Content-Type': 'application/json',
    },
  });
}
