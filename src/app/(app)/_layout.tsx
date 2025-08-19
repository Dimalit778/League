import { QueryLoadingBoundary } from '@/components/layout/QueryLoadingBoundary';
import { useAppStore } from '@/store/useAppStore';
import { Stack } from 'expo-router';

export default function AppLayout() {
  const { primaryLeague } = useAppStore();

  return (
    <QueryLoadingBoundary>
      <Stack>
        <Stack.Protected guard={!!primaryLeague}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="match/[id]" options={{ headerShown: false }} />
        </Stack.Protected>
        <Stack.Screen name="myLeagues" options={{ headerShown: false }} />
      </Stack>
    </QueryLoadingBoundary>
  );
}
