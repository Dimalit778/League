// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   FlatList,
//   TouchableOpacity,
//   RefreshControl,
//   Alert,
// } from "react-native";
// import { useNavigation } from "@react-navigation/native";
// import { StackNavigationProp } from "@react-navigation/stack";

// import { useAuthStore } from "../hooks/useAuthStore";
// import { useAppStore } from "../hooks/useAppStore";
// import { Button } from "../components/Button";
// import { League, RootStackParamList } from "../types";

// type LeaguesScreenNavigationProp = StackNavigationProp<RootStackParamList>;

// interface LeagueCardProps {
//   league: League;
//   isSelected: boolean;
//   onSelect: () => void;
// }

// const LeagueCard: React.FC<LeagueCardProps> = ({
//   league,
//   isSelected,
//   onSelect,
// }) => {
//   const getLeagueDisplayName = (league: string) => {
//     const names = {
//       premier_league: "Premier League",
//       la_liga: "La Liga",
//       bundesliga: "Bundesliga",
//       serie_a: "Serie A",
//       ligue_1: "Ligue 1",
//     };
//     return names[league as keyof typeof names] || league;
//   };

//   return (
//     <TouchableOpacity
//       style={[styles.leagueCard, isSelected && styles.selectedCard]}
//       onPress={onSelect}
//     >
//       <View style={styles.cardHeader}>
//         <Text style={styles.leagueName}>{league.name}</Text>
//         {isSelected && <Text style={styles.selectedIndicator}>Selected</Text>}
//       </View>
//       <Text style={styles.leagueType}>
//         {getLeagueDisplayName(league.selected_league)}
//       </Text>
//       <Text style={styles.inviteCode}>Code: {league.invite_code}</Text>
//     </TouchableOpacity>
//   );
// };

// export const LeaguesScreen: React.FC = () => {
//   const navigation = useNavigation<LeaguesScreenNavigationProp>();
//   const { user } = useAuthStore();
//   const { selectedLeague, userLeagues, loadUserLeagues, setSelectedLeague } =
//     useAppStore();

//   const [refreshing, setRefreshing] = useState(false);

//   useEffect(() => {
//     if (user) {
//       loadUserLeagues(user.id);
//     }
//   }, [user]);

//   const onRefresh = async () => {
//     if (!user) return;
//     setRefreshing(true);
//     await loadUserLeagues(user.id);
//     setRefreshing(false);
//   };

//   const handleLeagueSelect = (league: League) => {
//     setSelectedLeague(league);
//     Alert.alert("League Selected", `You've selected ${league.name}`);
//   };

//   const renderLeague = ({ item }: { item: League }) => (
//     <LeagueCard
//       league={item}
//       isSelected={selectedLeague?.id === item.id}
//       onSelect={() => handleLeagueSelect(item)}
//     />
//   );

//   return (
//     <View style={styles.container}>
//       <View style={styles.header}>
//         <Button
//           title="Create League"
//           onPress={() => navigation.navigate("CreateLeague")}
//           size="medium"
//         />
//         <Button
//           title="Join League"
//           onPress={() => navigation.navigate("JoinLeague", {})}
//           variant="secondary"
//           size="medium"
//         />
//       </View>

//       <FlatList
//         data={userLeagues}
//         renderItem={renderLeague}
//         keyExtractor={(item) => item.id}
//         refreshControl={
//           <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
//         }
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={styles.listContainer}
//         ListEmptyComponent={
//           <View style={styles.emptyContainer}>
//             <Text style={styles.emptyTitle}>No Leagues Yet</Text>
//             <Text style={styles.emptyText}>
//               Create your first league or join an existing one to get started!
//             </Text>
//           </View>
//         }
//       />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#F2F2F7",
//   },
//   header: {
//     backgroundColor: "#fff",
//     padding: 16,
//     flexDirection: "row",
//     gap: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: "#C7C7CC",
//   },
//   listContainer: {
//     paddingVertical: 16,
//     flexGrow: 1,
//   },
//   leagueCard: {
//     backgroundColor: "#fff",
//     margin: 16,
//     marginVertical: 8,
//     padding: 16,
//     borderRadius: 12,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   selectedCard: {
//     borderWidth: 2,
//     borderColor: "#007AFF",
//   },
//   cardHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 8,
//   },
//   leagueName: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#1C1C1E",
//   },
//   selectedIndicator: {
//     fontSize: 14,
//     color: "#007AFF",
//     fontWeight: "600",
//   },
//   leagueType: {
//     fontSize: 16,
//     color: "#8E8E93",
//     marginBottom: 4,
//   },
//   inviteCode: {
//     fontSize: 14,
//     color: "#8E8E93",
//     fontFamily: "monospace",
//   },
//   emptyContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 32,
//   },
//   emptyTitle: {
//     fontSize: 24,
//     fontWeight: "bold",
//     color: "#1C1C1E",
//     marginBottom: 8,
//     textAlign: "center",
//   },
//   emptyText: {
//     fontSize: 16,
//     color: "#8E8E93",
//     textAlign: "center",
//   },
// });
