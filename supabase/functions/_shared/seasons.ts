// Canonical writes for public.seasons. Sync functions use the service role, but
// all writes still flow through this helper so season rollover is consistent.
// deno-lint-ignore-file no-explicit-any

export type CurrentSeasonWrite = {
  id: number;
  competition_id: number;
  current_matchday?: number | null;
  current_stage?: string | null;
  total_matchdays?: number | null;
  season_start?: string | null;
  season_end?: string | null;
};

export async function upsertCurrentSeason(
  supabase: any,
  season: CurrentSeasonWrite,
): Promise<void> {
  const updatedAt = new Date().toISOString();

  const { error: clearError } = await supabase
    .from('seasons')
    .update({ is_current: false, updated_at: updatedAt })
    .eq('competition_id', season.competition_id)
    .eq('is_current', true)
    .neq('id', season.id);

  if (clearError) {
    throw new Error(
      `Failed clearing previous season for competition ${season.competition_id}: ${clearError.message}`,
    );
  }

  const { error: upsertError } = await supabase
    .from('seasons')
    .upsert(
      {
        ...season,
        is_current: true,
        updated_at: updatedAt,
      },
      { onConflict: 'id' },
    );

  if (upsertError) {
    throw new Error(
      `Failed upserting season ${season.id}: ${upsertError.message}`,
    );
  }
}
