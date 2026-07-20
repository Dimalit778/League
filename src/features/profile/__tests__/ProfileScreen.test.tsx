import { render } from '@testing-library/react-native';
import ProfileScreen from '@/features/profile/ProfileScreen';

jest.mock('@/store/MemberStore', () => {
  const state = {
    primaryMember: {
      memberId: 'm1',
      userId: 'u1',
      leagueId: 'l1',
      nickname: 'tester',
      avatarUrl: null,
      leagueName: 'My League',
    },
    setPrimaryMember: jest.fn(),
  };
  const useMemberStore: any = (selector: any) => selector(state);
  useMemberStore.getState = () => state;
  return {
    useMemberStore,
    usePrimaryMember: () => state.primaryMember,
    selectMemberId: (s: any) => s.primaryMember?.memberId,
    selectLeagueId: (s: any) => s.primaryMember?.leagueId,
    selectMemberUserId: (s: any) => s.primaryMember?.userId,
  };
});

// Stub the heavy stats components (SVG gauges/charts) — this test verifies the
// merged screen composition, not chart internals. StatsHeroCard echoes points so
// we can assert the stats section rendered.
jest.mock('@/features/memberStats/components', () => {
  const { Text } = require('react-native');
  return {
    SkeletonStats: () => <Text>skeleton</Text>,
    StatsHeroCard: ({ points }: { points: number }) => <Text>{`points:${points}`}</Text>,
    StatsPredictionSection: () => <Text>predictions</Text>,
    StatsRoundPerformance: () => <Text>rounds</Text>,
    StatsBestCategory: () => <Text>best-category</Text>,
  };
});

jest.mock('@/features/memberStats/components/Achievement', () => {
  const { Text } = require('react-native');
  return { Achievements: () => <Text>achievements</Text> };
});

jest.mock('@/features/memberStats/hooks/useMemberStats', () => ({
  useMemberStats: () => ({
    data: {
      totalPredictions: 10,
      bingoHits: 4,
      regularHits: 3,
      missedHits: 3,
      accuracy: 70,
      totalPoints: 42,
      position: 3,
      totalMembers: 8,
      currentStreak: 2,
      longestStreak: 5,
      roundPerformance: [],
      bestCategory: undefined,
    },
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  }),
}));

describe('ProfileScreen (merged Me tab)', () => {
  it('renders identity and a stats value without crashing', () => {
    const { queryByText, queryAllByText } = render(<ProfileScreen />);
    // StatsHeroCard total points (via stub)
    expect(queryByText('points:42')).toBeTruthy();
    // ProfileHeroCard identity (nickname is capitalized; also shown in nickname edit)
    expect(queryAllByText('Tester').length).toBeGreaterThan(0);
  });
});
