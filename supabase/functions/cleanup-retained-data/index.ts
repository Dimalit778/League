import { createRequestId, monitoredErrorResponse } from '../_shared/monitoring.ts';
import {
  createServiceClient,
  jsonResponse,
  requireSyncAuth,
} from '../_shared/sync.ts';

const PROFILE_IMAGES_BUCKET = Deno.env.get('PROFILE_IMAGES_BUCKET') ?? 'profile_images';
const ORPHAN_GRACE_MS = 7 * 24 * 60 * 60 * 1000;
const PAGE_SIZE = 100;

type StoredObject = {
  name: string;
  id?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

const listStoredObjects = async (
  client: ReturnType<typeof createServiceClient>,
  prefix = '',
): Promise<Array<StoredObject & { path: string }>> => {
  const objects: Array<StoredObject & { path: string }> = [];

  for (let offset = 0; ; offset += PAGE_SIZE) {
    const { data, error } = await client.storage
      .from(PROFILE_IMAGES_BUCKET)
      .list(prefix, { limit: PAGE_SIZE, offset, sortBy: { column: 'name', order: 'asc' } });

    if (error) throw new Error(`Could not list profile images: ${error.message}`);
    const page = (data ?? []) as StoredObject[];

    for (const entry of page) {
      const path = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.id) objects.push({ ...entry, path });
      else objects.push(...await listStoredObjects(client, path));
    }

    if (page.length < PAGE_SIZE) break;
  }

  return objects;
};

const loadReferencedPaths = async (
  client: ReturnType<typeof createServiceClient>,
): Promise<Set<string>> => {
  const referenced = new Set<string>();

  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await client
      .from('league_members')
      .select('avatar_url')
      .not('avatar_url', 'is', null)
      .range(offset, offset + 999);

    if (error) throw new Error(`Could not load avatar references: ${error.message}`);
    for (const row of data ?? []) {
      if (row.avatar_url && !row.avatar_url.includes('://')) referenced.add(row.avatar_url);
    }
    if (!data || data.length < 1000) break;
  }

  return referenced;
};

Deno.serve(async (req) => {
  const requestId = createRequestId(req);

  if (req.method !== 'POST') return jsonResponse({ success: false, requestId }, 405);
  const authError = requireSyncAuth(req);
  if (authError) return authError;

  try {
    const client = createServiceClient();
    const [referenced, stored] = await Promise.all([
      loadReferencedPaths(client),
      listStoredObjects(client),
    ]);
    const cutoff = Date.now() - ORPHAN_GRACE_MS;
    const orphaned = stored
      .filter((object) => {
        const createdAt = object.created_at ?? object.updated_at;
        return !referenced.has(object.path) && Boolean(createdAt) && Date.parse(createdAt!) < cutoff;
      })
      .map((object) => object.path);

    if (orphaned.length > 0) {
      const { error } = await client.storage.from(PROFILE_IMAGES_BUCKET).remove(orphaned);
      if (error) throw new Error(`Could not remove orphaned profile images: ${error.message}`);
    }

    return jsonResponse({
      success: true,
      requestId,
      scanned: stored.length,
      referenced: referenced.size,
      deleted: orphaned.length,
    });
  } catch (error) {
    return monitoredErrorResponse('cleanup-retained-data', error, 500, requestId);
  }
});
