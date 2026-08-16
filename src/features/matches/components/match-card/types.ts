import type { MatchCardData } from '../../utils/matchCard.mapper';

export type MatchCardProps = {
  match: MatchCardData;
  logoVariant?: 'team' | 'flag';
  onPress?: () => void;
  /** When set, card metrics use this width instead of the window width. */
  layoutWidth?: number;
};

export type MatchCardTeamData = MatchCardData['home'];
