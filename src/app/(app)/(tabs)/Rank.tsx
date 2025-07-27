import { useAuthStore } from "@/hooks/useAuthStore";
import { supabase } from "@/lib/supabase";
import { Button, Text, View } from "react-native";

export default function Rank() {
  const { user } = useAuthStore();
  console.log("user ---", JSON.stringify(user, null, 2));
  const createPost = async () => {
    const { data, error } = await supabase.from("posts").insert({
      title: "Hello World",
      content: "This is a test post",
      user_id: user?.id,
    });
    if (error) {
      console.log("error ---", JSON.stringify(error, null, 2));
    }
    if (data) {
      console.log("data ---", JSON.stringify(data, null, 2));
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "grey" }}>
      <Text>Rank</Text>
      <View style={{ flex: 1, alignItems: "center" }}>
        <Text>Create League Spain</Text>
        <Button title="Create League" onPress={createPost} />
      </View>
    </View>
  );
}
