import { createClient } from 'npm:@supabase/supabase-js@2';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
Deno.serve(async (req)=>{
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return json({
      error: 'Missing authorization header'
    }, 401);
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: {
        headers: {
          Authorization: authHeader
        }
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) return json({
      error: 'Unauthorized'
    }, 401);
    const userId = user.id;
    // 1. Handle leagues where the user is owner
    const { data: ownedLeagues, error: leaguesError } = await adminClient.from('leagues').select('id').eq('owner_id', userId);
    if (leaguesError) throw new Error(leaguesError.message);
    for (const league of ownedLeagues ?? []){
      const { data: nextMember } = await adminClient.from('league_members').select('user_id').eq('league_id', league.id).neq('user_id', userId).order('created_at', {
        ascending: true
      }).limit(1).maybeSingle();
      if (nextMember) {
        const { error } = await adminClient.from('leagues').update({
          owner_id: nextMember.user_id
        }).eq('id', league.id);
        if (error) throw new Error(error.message);
      } else {
        const { error } = await adminClient.from('leagues').delete().eq('id', league.id);
        if (error) throw new Error(error.message);
      }
    }
    // 2. Delete auth user — cascades: public.users → league_members → predictions → user_subscriptions
    const { error: authError } = await adminClient.auth.admin.deleteUser(userId);
    if (authError) throw new Error(authError.message);
    return json({
      success: true
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('delete-account error:', message);
    return json({
      error: message
    }, 500);
  }
});
function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}
