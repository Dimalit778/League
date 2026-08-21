import { Row } from '@/components';
import type { MatchPresentation } from '@/features/matches/model/matchPresentation';
import type { MatchDetails, MemberPrediction } from '@/features/matches/types';
import { useWindowDimensions, View } from 'react-native';
import { MatchHeroMeta } from './hero/MatchHeroMeta';
import { MatchHeroScore } from './hero/MatchHeroScore';
import { MatchHeroTeam } from './hero/MatchHeroTeam';
import { MatchPredictionEditor } from './prediction/MatchPredictionEditor';

type MatchHeroProps = {
  match: MatchDetails;
  memberPrediction?: MemberPrediction;
  presentation: MatchPresentation;
  onPredictionSaved?: () => void;
};

export default function MatchHero({ match, memberPrediction, presentation, onPredictionSaved }: MatchHeroProps) {
  const { width } = useWindowDimensions();
  const badgeSize = width >= 768 ? 100 : 62;

  return (
    <View>
      <MatchHeroMeta
        kickOff={match.kick_off}
        competitionName={match.competition?.name ?? ''}
        matchday={match.fixture ?? 0}
      />
      <View className="px-5 pt-6">
        <Row className="items-center justify-center">
          <MatchHeroTeam team={match.home_team ?? null} badgeSize={badgeSize} />
          <View className="w-28 items-center justify-center">
            <MatchHeroScore
              homeScore={match.score?.fullTime?.home ?? null}
              awayScore={match.score?.fullTime?.away ?? null}
              kickOff={match.kick_off}
              presentation={presentation}
            />
          </View>
          <MatchHeroTeam team={match.away_team ?? null} badgeSize={badgeSize} />
        </Row>

        {presentation.canPredict ? (
          <MatchPredictionEditor prediction={memberPrediction} matchId={match.id} onSaved={onPredictionSaved} />
        ) : null}
      </View>
    </View>
  );
}
