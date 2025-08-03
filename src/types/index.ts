import { League } from "./supabase.types";

export interface AppState {
  selectedLeague: League | null;
  userLeagues: League[] | null;
  loading: boolean;
}
