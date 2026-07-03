import { Screen } from '@/components/layout';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function Pulse({ className }: { className?: string }) {
  return <View className={`bg-[#223554] animate-pulse rounded ${className ?? ''}`} />;
}

export function SkeletonStats() {
  const insets = useSafeAreaInsets();

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1 bg-background"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Header */}
        <View style={{ paddingTop: insets.top }} className="flex-row items-center justify-between px-4 pb-2 pt-1">
          <View>
            <Pulse className="h-7 w-28 mb-1.5" />
            <Pulse className="h-4 w-20" />
          </View>
          <Pulse className="h-12 w-12 rounded-full" />
        </View>

        {/* Hero card */}
        <View className="mx-3 mt-1 rounded-3xl border border-[#223554] bg-[#101A2A] p-4">
          <View className="flex-row items-center gap-4">
            <Pulse className="h-20 w-20 rounded-full" />
            <View className="flex-1">
              <Pulse className="h-6 w-36 mb-2" />
              <Pulse className="h-4 w-24" />
            </View>
          </View>
          <View className="mt-5 flex-row rounded-2xl border border-[#223554] bg-[#091425]/60 p-3">
            <View className="flex-1 items-center gap-1">
              <Pulse className="h-4 w-4" />
              <Pulse className="h-3 w-10" />
              <Pulse className="h-5 w-8" />
            </View>
            <View className="mx-3 w-px self-stretch bg-[#223554]" />
            <View className="flex-1 items-center gap-1">
              <Pulse className="h-4 w-4" />
              <Pulse className="h-3 w-16" />
              <Pulse className="h-5 w-14" />
            </View>
          </View>
        </View>

        {/* Prediction section */}
        <View className="mx-3 mt-4 flex-row gap-2">
          <View className="flex-1 rounded-2xl border border-[#223554] bg-[#101A2A] p-3">
            <Pulse className="h-3 w-28 mb-3" />
            <Pulse className="h-[110px] w-[110px] rounded-full self-center" />
            <Pulse className="h-3 w-32 mt-3 self-center" />
          </View>
          <View className="flex-1 gap-2">
            <View className="flex-1 flex-row gap-2">
              <View className="flex-1 rounded-xl border border-[#223554] bg-[#101A2A] p-2.5">
                <Pulse className="h-7 w-7 rounded-lg mb-1.5" />
                <Pulse className="h-3 w-16 mb-1" />
                <Pulse className="h-5 w-6" />
              </View>
              <View className="flex-1 rounded-xl border border-[#223554] bg-[#101A2A] p-2.5">
                <Pulse className="h-7 w-7 rounded-lg mb-1.5" />
                <Pulse className="h-3 w-20 mb-1" />
                <Pulse className="h-5 w-6" />
              </View>
            </View>
            <View className="flex-1 flex-row gap-2">
              <View className="flex-1 rounded-xl border border-[#223554] bg-[#101A2A] p-2.5">
                <Pulse className="h-7 w-7 rounded-lg mb-1.5" />
                <Pulse className="h-3 w-16 mb-1" />
                <Pulse className="h-5 w-4" />
              </View>
              <View className="flex-1 rounded-xl border border-[#223554] bg-[#101A2A] p-2.5">
                <Pulse className="h-7 w-7 rounded-lg mb-1.5" />
                <Pulse className="h-3 w-16 mb-1" />
                <Pulse className="h-5 w-4" />
              </View>
            </View>
          </View>
        </View>

        {/* Round performance */}
        <View className="mx-3 mt-5">
          <Pulse className="h-5 w-44 mb-3" />
          <View className="rounded-2xl border border-[#223554] bg-[#101A2A] p-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <View key={i}>
                <View className="flex-row justify-between mb-1">
                  <Pulse className="h-3 w-14" />
                  <Pulse className="h-3 w-10" />
                </View>
                <Pulse className="h-2.5 w-full rounded-full" />
              </View>
            ))}
          </View>
        </View>

        {/* Best category */}
        <View className="mx-3 mt-5 rounded-2xl border border-[#223554] bg-[#101A2A] p-4 flex-row items-center">
          <Pulse className="h-12 w-12 rounded-full mr-3" />
          <View className="flex-1 gap-1.5">
            <Pulse className="h-3 w-20" />
            <Pulse className="h-4 w-28" />
            <Pulse className="h-3 w-36" />
          </View>
          <Pulse className="h-8 w-24 rounded-xl" />
        </View>
      </ScrollView>
    </Screen>
  );
}
