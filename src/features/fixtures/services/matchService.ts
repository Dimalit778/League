import { supabase } from "@/lib/supabase/supabase";

const getMatches = async (competition_id: number, matchday: number) => {
  const { data, error } = await supabase
    .from("matches")
    .select("*")
    .eq("competition_id", competition_id)
    .eq("matchday", matchday);
  return { data, error };
};

const getMatchById = async (match_id: number) => {
  const { data, error } = await supabase
    .from("matches")
    .select("*")
    .eq("id", match_id);
  return { data, error };
};
const getMatchesByFixture = async (fixture_id: number) => {
  const { data, error } = await supabase
    .from("matches")
    .select("*")
    .eq("fixture_id", fixture_id);
  return { data, error };
};

export { getMatchById, getMatches, getMatchesByFixture };
