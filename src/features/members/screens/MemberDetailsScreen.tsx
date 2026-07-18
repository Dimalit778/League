// import { Error, Screen } from '@/components/layout';
// import { AvatarImage, BackButton, Card, Text } from '@/components/ui';
// import SkeletonMatches from '@/features/matches/components/MatchesSkeleton';
// import { useGetFinishedFixtures, useGetMemberFinishedMatches } from '@/features/matches/hooks/useMatches';
// import { mapMatchToCardProps } from '@/features/matches/utils/matchCard.mapper';
// import { useEffect, useMemo, useState } from 'react';
// import { View } from 'react-native';
// import MemberDetailsSkeleton from '../components/MemberDetailsSkeleton';
// import MemberStats from '../components/memberStats';

// const MemberDetailsScreen = ({ memberId }: { memberId: string }) => {
//   const { data, error, isLoading } = useMemberDataAndStats(memberId);
//   const { member, stats, totalFixtures = [], currentFixture = 1 } = data ?? {};
//   const competitionId = member?.league?.competition?.id ?? 0;

//   const { data: finishedFixtures = [] } = useGetFinishedFixtures(competitionId || null);

//   const availableFixtures = useMemo(() => {
//     if (finishedFixtures.length === 0) return totalFixtures;
//     return totalFixtures.filter((fixture) => finishedFixtures.includes(fixture));
//   }, [totalFixtures, finishedFixtures]);

//   const initialFixture = useMemo(() => {
//     if (finishedFixtures.length > 0) return finishedFixtures[0];
//     return currentFixture;
//   }, [finishedFixtures, currentFixture]);

//   const [selectedFixture, setSelectedFixture] = useState<number>(initialFixture);
//   const [animateScroll, setAnimateScroll] = useState(false);

//   useEffect(() => {
//     setSelectedFixture(initialFixture);
//   }, [initialFixture]);

//   useEffect(() => {
//     if (availableFixtures.length > 0 && !availableFixtures.includes(selectedFixture)) {
//       setSelectedFixture(availableFixtures[0]);
//     }
//   }, [availableFixtures, selectedFixture]);

//   const {
//     data: matches = [],
//     isLoading: matchesLoading,
//     error: matchesError,
//     refetch: refetchMatches,
//   } = useGetMemberFinishedMatches(memberId, competitionId || null, selectedFixture);

//   const handleFixturePress = (fixture: number) => {
//     setSelectedFixture(fixture);
//     setAnimateScroll(true);
//   };

//   const matchCards = useMemo(() => matches.map(mapMatchToCardProps), [matches]);

//   if (error || matchesError) return <Error error={error || (matchesError as Error)} />;

//   return (
//     <Screen edges={['top']}>
//       <BackButton />

//       {isLoading ? (
//         <MemberDetailsSkeleton />
//       ) : (
//         <>
//           <Card className="px-3 py-1.5">
//             <View className="flex-row items-center gap-3">
//               <View className="w-14 h-14 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full overflow-hidden">
//                 <AvatarImage nickname={member?.nickname ?? ''} path={member?.avatar_url || null} />
//               </View>

//               <View className="flex-1">
//                 <Text variant="body" bold numberOfLines={1}>
//                   {member?.nickname}
//                 </Text>
//               </View>
//               <View className="flex-row items-center gap-4">
//                 <View className="items-end">
//                   <Text variant="caption" className="text-muted uppercase">
//                     Points
//                   </Text>
//                   <Text variant="body" bold>
//                     {stats?.totalPoints.toLocaleString() ?? 0}
//                   </Text>
//                 </View>
//                 <View className="h-6 w-px bg-border" />
//                 <View className="items-end">
//                   <Text variant="caption" className="text-muted uppercase">
//                     Position
//                   </Text>
//                   <Text variant="body" bold>
//                     {stats?.position ?? '—'}
//                   </Text>
//                 </View>
//               </View>
//             </View>
//           </Card>

//           <MemberStats stats={stats} />
//           <View className="py-1">
//             <FixturesList
//               fixtures={availableFixtures}
//               selectedFixture={selectedFixture}
//               handleFixturePress={handleFixturePress}
//               animateScroll={animateScroll}
//               fixtureDateRanges={[]}
//             />
//           </View>
//           <View className="mt-2 min-h-0 flex-1">
//             {matchesLoading ? (
//               <SkeletonMatches />
//             ) : (
//               <MatchesList matches={matchCards} onRefresh={() => void refetchMatches()} />
//             )}
//           </View>
//         </>
//       )}
//     </Screen>
//   );
// };

// export default MemberDetailsScreen;
