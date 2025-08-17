import { supabase } from "@/lib/supabase";
import { Tables } from "@/types/database.types";

type Team = Tables<"teams">;

export const teamService = {
  async getAllTeams() {
    const { data, error } = await supabase
      .from("teams")
      .select("*")
      .order("name", { ascending: true });

    if (error) throw error;
    return data;
  },

  async getTeamById(id: number) {
    const { data, error } = await supabase
      .from("teams")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  async getTeamsByIds(ids: number[]) {
    const { data, error } = await supabase
      .from("teams")
      .select("*")
      .in("id", ids)
      .order("name", { ascending: true });

    if (error) throw error;
    return data;
  },

  async searchTeams(searchTerm: string) {
    const { data, error } = await supabase
      .from("teams")
      .select("*")
      .ilike("name", `%${searchTerm}%`)
      .order("name", { ascending: true })
      .limit(10);

    if (error) throw error;
    return data;
  }
};