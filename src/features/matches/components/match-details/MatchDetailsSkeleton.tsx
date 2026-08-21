import { Skeleton, TextSkeleton } from '@/components';
import { useTranslation } from '@/hooks/useTranslation';
import { useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function MatchDetailsSkeleton() {
  const inset = useSafeAreaInsets();
  const { t } = useTranslation();
  const { height, width } = useWindowDimensions();
  const badgeSize = width >= 768 ? 120 : 80;
  const heroHeight = height * 0.35;

  return (
    <View className="mx-auto w-full max-w-lg flex-1 bg-background" accessibilityLabel={t('Loading match details')}>
      <View style={{ height: heroHeight, paddingTop: inset.top }} className="bg-surface">
        <View className="flex-1 items-center justify-center gap-6 px-4">
          <View className="w-full flex-row items-center justify-center">
            <View className="min-w-0 flex-1 items-center gap-2">
              <Skeleton
                className={badgeSize >= 120 ? 'h-[120px] w-[120px] rounded-full' : 'h-[80px] w-[80px] rounded-full'}
              />
              <TextSkeleton className="h-6 w-16" />
            </View>

            <View className="w-32 items-center justify-center">
              <Skeleton className="h-12 w-24 rounded-2xl" />
            </View>

            <View className="min-w-0 flex-1 items-center gap-2">
              <Skeleton
                className={badgeSize >= 120 ? 'h-[120px] w-[120px] rounded-full' : 'h-[80px] w-[80px] rounded-full'}
              />
              <TextSkeleton className="h-6 w-16" />
            </View>
          </View>
        </View>
      </View>

      <View className="-mt-5 min-h-0 flex-1 overflow-hidden rounded-t-3xl border-t border-border bg-background px-4 pt-5">
        <View className="gap-4">
          <Skeleton className="mx-auto h-7 w-32 rounded-full" />
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-20 w-full rounded-2xl" />
          <Skeleton className="h-20 w-full rounded-2xl" />
        </View>
      </View>

      <View
        className="border-t border-border bg-background px-4 pt-3"
        style={{ paddingBottom: Math.max(inset.bottom, 12) }}
      >
        <Skeleton className="h-12 w-full rounded-xl" />
      </View>
    </View>
  );
}
