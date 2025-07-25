// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   Alert,
// } from "react-native";
// import { useNavigation } from "@react-navigation/native";
// import { StackNavigationProp } from "@react-navigation/stack";

// import { useAuthStore } from "../hooks/useAuthStore";
// import { useAppStore } from "../hooks/useAppStore";
// import { Input } from "../components/Input";
// import { Button } from "../components/Button";
// import { createLeague } from "../services/supabase";
// import { FootballLeague, RootStackParamList } from "../types";

// type CreateLeagueScreenNavigationProp = StackNavigationProp<RootStackParamList>;

// const FOOTBALL_LEAGUES = [
//   { id: "premier_league", name: "Premier League", country: "England" },
//   { id: "la_liga", name: "La Liga", country: "Spain" },
//   { id: "bundesliga", name: "Bundesliga", country: "Germany" },
//   { id: "serie_a", name: "Serie A", country: "Italy" },
//   { id: "ligue_1", name: "Ligue 1", country: "France" },
// ];

// interface LeagueOptionProps {
//   league: { id: string; name: string; country: string };
//   isSelected: boolean;
//   onSelect: () => void;
// }

// const LeagueOption: React.FC<LeagueOptionProps> = ({
//   league,
//   isSelected,
//   onSelect,
// }) => (
//   <TouchableOpacity
//     style={[styles.leagueOption, isSelected && styles.selectedOption]}
//     onPress={onSelect}
//   >
//     <View>
//       <Text style={[styles.leagueName, isSelected && styles.selectedText]}>
//         {league.name}
//       </Text>
//       <Text
//         style={[styles.leagueCountry, isSelected && styles.selectedSubtext]}
//       >
//         {league.country}
//       </Text>
//     </View>
//     {isSelected && <Text style={styles.checkmark}>✓</Text>}
//   </TouchableOpacity>
// );

// export const CreateLeagueScreen: React.FC = () => {
//   const navigation = useNavigation<CreateLeagueScreenNavigationProp>();
//   const { user } = useAuthStore();
//   const { addLeague } = useAppStore();

//   const [name, setName] = useState("");
//   const [selectedLeague, setSelectedLeague] =
//     useState<FootballLeague>("premier_league");
//   const [maxMembers, setMaxMembers] = useState("20");
//   const [loading, setLoading] = useState(false);

//   const generateInviteCode = () => {
//     return Math.random().toString(36).substring(2, 8).toUpperCase();
//   };

//   const handleCreateLeague = async () => {
//     if (!name.trim()) {
//       Alert.alert("Error", "Please enter a league name");
//       return;
//     }

//     if (!user) {
//       Alert.alert("Error", "You must be logged in to create a league");
//       return;
//     }

//     // Check subscription limits for free users
//     if (user.subscription_tier === "free") {
//       // In a real app, you'd check how many leagues the user already has
//       // For now, we'll assume they can create up to 2 leagues
//     }

//     try {
//       setLoading(true);

//       const leagueData = {
//         name: name.trim(),
//         selected_league: selectedLeague,
//         admin_id: user.id,
//         invite_code: generateInviteCode(),
//         max_members: parseInt(maxMembers, 10),
//       };

//       const { data, error } = await createLeague(leagueData);

//       if (error) {
//         Alert.alert("Error", "Failed to create league");
//         return;
//       }

//       if (data) {
//         addLeague(data);
//         Alert.alert("Success", "League created successfully!", [
//           {
//             text: "OK",
//             onPress: () => navigation.goBack(),
//           },
//         ]);
//       }
//     } catch (error) {
//       Alert.alert("Error", "An unexpected error occurred");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <ScrollView style={styles.container} contentContainerStyle={styles.content}>
//       <View style={styles.section}>
//         <Text style={styles.sectionTitle}>League Details</Text>

//         <Input
//           label="League Name"
//           value={name}
//           onChangeText={setName}
//           placeholder="Enter league name"
//           maxLength={50}
//         />

//         <Input
//           label="Max Members"
//           value={maxMembers}
//           onChangeText={setMaxMembers}
//           placeholder="20"
//           keyboardType="numeric"
//           maxLength={2}
//         />
//       </View>

//       <View style={styles.section}>
//         <Text style={styles.sectionTitle}>Select Football League</Text>

//         {FOOTBALL_LEAGUES.map((league) => (
//           <LeagueOption
//             key={league.id}
//             league={league}
//             isSelected={selectedLeague === league.id}
//             onSelect={() => setSelectedLeague(league.id as FootballLeague)}
//           />
//         ))}
//       </View>

//       <View style={styles.buttonContainer}>
//         <Button
//           title="Create League"
//           onPress={handleCreateLeague}
//           loading={loading}
//           size="large"
//         />
//       </View>
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#F2F2F7",
//   },
//   content: {
//     padding: 16,
//   },
//   section: {
//     marginBottom: 32,
//   },
//   sectionTitle: {
//     fontSize: 20,
//     fontWeight: "bold",
//     color: "#1C1C1E",
//     marginBottom: 16,
//   },
//   leagueOption: {
//     backgroundColor: "#fff",
//     padding: 16,
//     borderRadius: 12,
//     marginBottom: 8,
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     borderWidth: 1,
//     borderColor: "#C7C7CC",
//   },
//   selectedOption: {
//     borderColor: "#007AFF",
//     backgroundColor: "#F0F8FF",
//   },
//   leagueName: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: "#1C1C1E",
//   },
//   leagueCountry: {
//     fontSize: 14,
//     color: "#8E8E93",
//     marginTop: 2,
//   },
//   selectedText: {
//     color: "#007AFF",
//   },
//   selectedSubtext: {
//     color: "#007AFF",
//   },
//   checkmark: {
//     fontSize: 20,
//     color: "#007AFF",
//     fontWeight: "bold",
//   },
//   buttonContainer: {
//     marginTop: 32,
//   },
// });
