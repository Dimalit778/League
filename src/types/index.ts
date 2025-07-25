// // App-specific types
import { League } from "./database.types";

// export type FootballLeague =
//   | "premier_league"
//   | "la_liga"
//   | "bundesliga"
//   | "serie_a"
//   | "ligue_1";

// export interface LeagueInfo {
//   id: FootballLeague;
//   name: string;
//   country: string;
//   apiCode: string;
//   color: string;
// }

// export interface AuthState {
//   user: User | null;
//   session: any | null;
//   loading: boolean;
// }

export interface AppState {
  selectedLeague: League | null;
  userLeagues: League[] | null;
  loading: boolean;
}

// export interface CreateLeagueForm {
//   name: string;
//   selectedLeague: FootballLeague;
//   maxMembers: number;
// }

// export interface PredictionForm {
//   homeScore: string;
//   awayScore: string;
// }

// export interface AuthForm {
//   email: string;
//   password: string;
//   displayName?: string;
// }

// // API Response types
// export interface ApiResponse<T> {
//   data?: T;
//   error?: string;
//   success: boolean;
// }

// export interface PaginatedResponse<T> {
//   data: T[];
//   total: number;
//   page: number;
//   limit: number;
// }

// // Error types
// export interface AppError {
//   message: string;
//   code?: string;
//   details?: any;
// }

// // Notification types
// export interface PushNotification {
//   title: string;
//   body: string;
//   data?: any;
// }
