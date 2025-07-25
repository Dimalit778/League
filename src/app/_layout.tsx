import "../../global.css";

import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Slot, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { Text } from "react-native";

const queryClient = new QueryClient();

const InitialApp = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const segment = useSegments();
  // console.log("session", JSON.stringify(session, null, 2));

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setLoading(false);
      }
    );
    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);
  useEffect(() => {
    if (loading) return;
    const inAuthGroup = segment[0] === "(auth)";
    if (session && !inAuthGroup) {
      router.replace("/(app)/(tabs)/League");
    } else if (!session) {
      router.replace("/(auth)");
    }
  }, [session, loading]);

  if (loading) {
    return <Text>Loading...</Text>;
  }

  return <Slot />;
};
export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <InitialApp />
    </QueryClientProvider>
  );
}
