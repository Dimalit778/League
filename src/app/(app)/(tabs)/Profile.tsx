import ThemeToggle from "@/components/ThemeToggle";
import { useAppStore } from "@/store/useAppStore";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function Profile() {
  const { user, logout } = useAppStore();

  const loading = false;
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.full_name || "");

  const handleSignOut = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          const result = await logout();
          // if (!result.success) {
          //   Alert.alert("Error", result.error || "Failed to sign out");
          // }
        },
      },
    ]);
  };

  // --- Cancel edit ---
  const handleCancelEdit = () => {
    setFullName(user?.full_name || "");
    setIsEditing(false);
  };

  // --- Save profile ---

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-grow  px-4">
        <View className="bg-surface  rounded-xl border border-border shadow-sm p-4 mb-4 items-center gap-2">
          <View className="bg-primary rounded-full w-20 h-20 justify-center items-center">
            <Text className="text-text text-2xl font-bold">
              {(user?.full_name || user?.email || "U").charAt(0).toUpperCase()}
            </Text>
          </View>

          <Text className="text-text text-base font-bold">
            {user?.full_name}
          </Text>
          <Text className="text-textMuted text-sm">{user?.email}</Text>
        </View>

        <View className="bg-surface rounded-xl border border-border shadow-sm p-4 mb-4">
          {/* --Theme Toggle-- */}
          <View className="flex-row justify-end items-center mb-4">
            <ThemeToggle />
          </View>

          {/* Profile Information */}
          <View className="bg-surface rounded-xl border border-border shadow-sm p-4 mb-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-text text-base font-bold">
                Profile Information
              </Text>
              {!isEditing ? (
                <TouchableOpacity
                  onPress={() => setIsEditing(true)}
                  className="bg-primary rounded-xl border border-border shadow-sm p-4 mb-4 justify-center items-center"
                >
                  <Text className="text-text text-base font-bold">Edit</Text>
                </TouchableOpacity>
              ) : null}
            </View>

            <View className="gap-4">
              <View className="flex-row justify-between items-center">
                <Text className="text-text text-base font-bold">
                  Display Name
                </Text>
                {isEditing ? (
                  <TextInput
                    className="bg-surface rounded-xl border border-border shadow-sm p-4"
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder="Enter first name"
                  />
                ) : (
                  <Text className="text-text text-base font-bold">
                    {user?.full_name || "Not set"}
                  </Text>
                )}
              </View>

              <View className="flex-row justify-between items-center">
                <Text className="text-text text-base font-bold">Email</Text>

                <Text className="text-text text-base font-bold">
                  {user?.email || "Not set"}
                </Text>
              </View>

              <View className="flex-row justify-between items-center">
                <Text className="text-text text-base font-bold">
                  Subscription
                </Text>
                <View className="bg-primary rounded-full px-2 py-1">
                  <Text className="text-text text-base font-bold">
                    subscription
                    {/* {user?.subscription  ? "Premium" : "Free"}{" "}
                    {user?.subscription} */}
                  </Text>
                </View>
              </View>

              <View className="flex-row justify-between items-center">
                <Text className="text-text text-base font-bold">
                  Member Since
                </Text>
                <Text className="text-text text-base font-bold">
                  create at
                  {/* {user?.created_at
                    ? new Date(user.created_at).toLocaleDateString()
                    : "N/A"} */}
                </Text>
              </View>
            </View>
          </View>

          {/* Account Actions */}
          <View className="bg-surface rounded-xl border border-border shadow-sm p-4 mb-4">
            <Text className="text-text text-base font-bold">Account</Text>

            <TouchableOpacity className="flex-row justify-between items-center">
              <Text className="text-text text-base font-bold">
                Change Password
              </Text>
              <Text className="text-text text-base font-bold">›</Text>
            </TouchableOpacity>

            <TouchableOpacity className="flex-row justify-between items-center">
              <Text className="text-text text-base font-bold">
                Privacy Settings
              </Text>
              <Text className="text-text text-base font-bold">›</Text>
            </TouchableOpacity>

            <TouchableOpacity className="flex-row justify-between items-center">
              <Text className="text-text text-base font-bold">
                Help & Support
              </Text>
              <Text className="text-text text-base font-bold">›</Text>
            </TouchableOpacity>
          </View>

          {/* Sign Out */}
          <TouchableOpacity
            onPress={handleSignOut}
            className="bg-primary rounded-xl border border-border shadow-sm p-4 mb-4 justify-center items-center"
            disabled={loading}
          >
            <Text className="text-text text-base font-bold">Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6B7280",
  },

  header: {
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#6366F1",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: "#6B7280",
  },
  verificationBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 12,
  },
  verificationText: {
    fontSize: 14,
    color: "#92400E",
    flex: 1,
  },
  verificationButton: {
    backgroundColor: "#F59E0B",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
  },
  verificationButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  content: {
    flex: 1,
    padding: 24,
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.05)",
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  editButton: {
    backgroundColor: "#6366F1",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  profileInfo: {
    gap: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: "#1F2937",
    flex: 2,
    textAlign: "right",
  },
  input: {
    flex: 2,
    height: 40,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 6,
    paddingHorizontal: 12,
    fontSize: 14,
    backgroundColor: "#FFFFFF",
    textAlign: "right",
  },
  subscriptionBadge: {
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  subscriptionText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6366F1",
  },
  editActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    height: 44,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#6B7280",
  },
  saveButton: {
    flex: 1,
    height: 44,
    backgroundColor: "#6366F1",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  saveButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  actionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  actionText: {
    fontSize: 16,
    color: "#1F2937",
  },
  actionArrow: {
    fontSize: 20,
    color: "#9CA3AF",
  },
  signOutButton: {
    height: 48,
    backgroundColor: "#DC2626",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  signOutButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
