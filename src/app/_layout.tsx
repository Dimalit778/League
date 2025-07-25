import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Slot } from "expo-router";

const queryClient = new QueryClient();

export default function RootLayout() {
  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

  if (!publishableKey) {
    throw new Error("Add EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env");
  }

  return (
    <QueryClientProvider client={queryClient}>
      {/* <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}> */}
      {/* <ClerkLoaded> */}
      <Slot />
      {/* </ClerkLoaded> */}
      {/* </ClerkProvider> */}
    </QueryClientProvider>
  );
}
