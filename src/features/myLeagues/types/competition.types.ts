export interface Competition {
    id: number;
    name: string;
    type: string;
    logo?: string;
    country_name?: string;
    country_code?: string;
    country_flag?: string;
    current_season: number;
    season_start?: string;
    season_end?: string;
  }