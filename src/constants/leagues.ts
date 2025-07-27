import { FootballLeague } from "@/types/database.types";

export interface LeagueOption {
  id: FootballLeague;
  name: string;
  country: string;
  flag: any;
  logo: any;
  color: string;
  apiCode?: string;
}

export const LEAGUE_OPTIONS: LeagueOption[] = [
  {
    id: "premier_league",
    name: "Premier League",
    country: "England",
    flag: require("../../assets/images/flags/england.png"),
    logo: require("../../assets/images/leagues/praimerLigaLogo.jpg"),
    color: "#3D195B",
    apiCode: "PL",
  },
  {
    id: "la_liga",
    name: "La Liga",
    country: "Spain",
    flag: require("../../assets/images/flags/spain.png"),
    logo: require("../../assets/images/leagues/laligaLogo.jpg"),
    color: "#FF6B35",
    apiCode: "PD",
  },
  {
    id: "bundesliga",
    name: "Bundesliga",
    country: "Germany",
    flag: require("../../assets/images/flags/germany.png"),
    logo: require("../../assets/images/leagues/bundesliga.jpg"),
    color: "#D20515",
    apiCode: "BL1",
  },
  {
    id: "serie_a",
    name: "Serie A",
    country: "Italy",
    flag: require("../../assets/images/flags/italy.png"),
    logo: require("../../assets/images/leagues/laliag.jpg"), // Using available image as placeholder
    color: "#0066CC",
    apiCode: "SA",
  },
  {
    id: "ligue_1",
    name: "Ligue 1",
    country: "France",
    flag: require("../../assets/images/flags/france.png"),
    logo: require("../../assets/images/leagues/laligaLogo.jpg"), // Using available image as placeholder
    color: "#1E3A8A",
    apiCode: "FL1",
  },
];

export const getLeagueById = (id: FootballLeague): LeagueOption | undefined => {
  return LEAGUE_OPTIONS.find((league) => league.id === id);
};

export const getLeagueByName = (name: string): LeagueOption | undefined => {
  return LEAGUE_OPTIONS.find(
    (league) => league.name.toLowerCase() === name.toLowerCase()
  );
};

export const getAllLeagues = (): LeagueOption[] => {
  return LEAGUE_OPTIONS;
};
