import { Tables } from '@/types/database.types';

export type ComMetadata ={
  id: number;
  code: string | null;
  currentStage: string | null;
  currentFixture: number;
  totalFixtures: number;
  type: string | null;
  seasonId: number | null;
  allFixtures: number[];
}

export type TeamType = Pick<
  Tables<'teams'>,
  'id' | 'shortName' | 'name' | 'logo' | 'tla' | 'venue'
>;

export type PredictionsType = Pick<
  Tables<'predictions'>,
  'id' | 'match_id' | 'league_member_id' | 'home_score' | 'away_score' | 'points' | 'is_finished'
>;
export type StatusType = Tables<'matches'>['status'];
export type ScoreType = {
  winner: 'HOME_TEAM' | 'AWAY_TEAM' | 'DRAW' | null;
  duration: 'REGULAR' | 'EXTRA_TIME' | 'PENALTY_SHOOTOUT' | null;
  fullTime?: { home: number | null; away: number | null };
  halfTime?: { home: number | null; away: number | null };
};

export type MatchBaseType = Pick<
  Tables<'matches'>,
  | 'id'
  | 'competition_id'
  | 'fixture'
  | 'kick_off'
  | 'stage'
  | 'group'
  | 'updated_at'
  | 'home_team_id'
  | 'away_team_id'
  | 'ai_predicted_home_score'
  | 'ai_predicted_away_score'
  | 'ai_generated_at'
> & {
  status: StatusType;
  score: ScoreType | null;
  home_team: TeamType | null;
  away_team: TeamType | null;
  competition: Pick<Tables<'competitions'>, 'id' | 'name'> | null;
};

/** ai_summary_en/he are PRO-gated server-side and fetched separately from the match row — see matchesApi.getMatchAiSummary. */
export type AiSummaryType = Pick<Tables<'matches'>, 'ai_summary_en' | 'ai_summary_he'>;

/** A match row used by lists, tournaments, and cards with the current member's prediction. */
export type MatchListItem = MatchBaseType & {
  prediction: PredictionsType | null;
};

/** Raw Supabase list row before its predictions array is flattened. */
export type RawMatchListItem = MatchBaseType & {
  predictions: PredictionsType[] | null;
};

export type MemberPrediction = PredictionsType & {
  league_member: Pick<
    Tables<'league_members'>,
    'id' | 'league_id' | 'user_id' | 'nickname' | 'avatar_url' | 'is_primary'
  > | null;
};

/** Full match details with predictions from every member in the active league. */
export type MatchDetails = MatchBaseType & {
  predictions: MemberPrediction[];
};

/** @deprecated Use MatchListItem. */
export type MatchCardType = MatchListItem;
/** @deprecated Use RawMatchListItem. */
export type MatchCardRawType = RawMatchListItem;
/** @deprecated Use MatchListItem. */
export type MatchWithPredictionsType = MatchListItem;
/** @deprecated Use MatchDetails. */
export type MatchWithAllPredictionsType = MatchDetails;
/** @deprecated Use MatchDetails. */
export type MatchWithPredictions = MatchDetails;
/** @deprecated Use MemberPrediction. */
export type PredictionWithMemberType = MemberPrediction;
/** @deprecated Use MemberPrediction. */
export type PredictionMemberType = MemberPrediction;

export * from './footballStages';
