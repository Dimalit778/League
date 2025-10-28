import { Screen } from '@/components/ui';
import { View } from 'react-native';
const SkeletonMatchDetails = () => {
  return (
    <Screen>
      <View className="flex-1 bg-background">
        <View className=" bg-surface p-4 pt-16 h-2/5">
          {/* Header */}
          <View className="flex-row items-center justify-between pt-2">
            <View className="w-10 h-10 bg-background rounded-lg animate-pulse" />
          </View>

          {/* Stadium location */}
          <View className="items-center">
            <View className="h-5 w-56 bg-background rounded-md animate-pulse" />
          </View>

          {/* Main match card */}
          <View className="bg-surface rounded-3xl p-4 mx-2 mt-6">
            <View className="flex-row justify-between items-center">
              {/* Home team */}
              <View className="items-center flex-1">
                <View className="w-28 h-28 bg-background rounded-full animate-pulse mb-4"></View>
                <View className="h-6 w-28 bg-background rounded-lg animate-pulse" />
              </View>

              {/* Center time/status */}
              <View className="items-center px-6">
                <View className="h-8 w-16 bg-background rounded-xl animate-pulse" />
              </View>

              {/* Away team */}
              <View className="items-center flex-1">
                <View className="w-28 h-28 bg-background rounded-full animate-pulse mb-4"></View>
                <View className="h-6 w-28 bg-background rounded-lg animate-pulse" />
              </View>
            </View>
          </View>
        </View>
      </View>
    </Screen>
  );
};

export default SkeletonMatchDetails;
