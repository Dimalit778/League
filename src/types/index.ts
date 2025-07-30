import { TLeague } from "./database.types";


    export interface AppState {
      selectedLeague: TLeague | null;
      userLeagues: TLeague[] | null;
      loading: boolean;
    }
