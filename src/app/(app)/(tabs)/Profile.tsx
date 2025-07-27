import { useAuthStore } from "@/hooks/useAuthStore";
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
  const { user, signOut, loading } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState(user?.first_name || "");
  const [lastName, setLastName] = useState(user?.last_name || "");

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
          const result = await signOut();
          if (!result.success) {
            Alert.alert("Error", result.error || "Failed to sign out");
          }
        },
      },
    ]);
  };

  // --- Cancel edit ---
  const handleCancelEdit = () => {
    setFirstName(user?.first_name || "");
    setLastName(user?.last_name || "");
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
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {(user?.first_name || user?.email || "U").charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.name}>{user?.first_name || "User"}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        <View style={styles.content}>
          {/* Profile Information */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Profile Information</Text>
              {!isEditing ? (
                <TouchableOpacity
                  onPress={() => setIsEditing(true)}
                  style={styles.editButton}
                >
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
              ) : null}
            </View>

            <View style={styles.profileInfo}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Display Name</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.input}
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholder="Enter first name"
                  />
                ) : (
                  <Text style={styles.infoValue}>
                    {user?.first_name || "Not set"}
                  </Text>
                )}
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Last Name</Text>

                <Text style={styles.infoValue}>
                  {user?.last_name || "Not set"}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{user?.email}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Subscription</Text>
                <View style={styles.subscriptionBadge}>
                  <Text style={styles.subscriptionText}>
                    {user?.subscription_tier === "premium" ? "Premium" : "Free"}
                  </Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Member Since</Text>
                <Text style={styles.infoValue}>
                  create at
                  {/* {user?.created_at
                    ? new Date(user.created_at).toLocaleDateString()
                    : "N/A"} */}
                </Text>
              </View>
            </View>
          </View>

          {/* Account Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>

            <TouchableOpacity style={styles.actionItem}>
              <Text style={styles.actionText}>Change Password</Text>
              <Text style={styles.actionArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem}>
              <Text style={styles.actionText}>Privacy Settings</Text>
              <Text style={styles.actionArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem}>
              <Text style={styles.actionText}>Help & Support</Text>
              <Text style={styles.actionArrow}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Sign Out */}
          <TouchableOpacity
            onPress={handleSignOut}
            style={styles.signOutButton}
            disabled={loading}
          >
            <Text style={styles.signOutButtonText}>Sign Out</Text>
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
  scrollContent: {
    flexGrow: 1,
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
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
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
