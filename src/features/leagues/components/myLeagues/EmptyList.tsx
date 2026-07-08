import { Text, MyImage } from '@/components/ui';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import standingEmoji from '@assets/emoji/standing-emoji.png';
import { View } from 'react-native';

export default function EmptyList({ message }: { message: string }) {
  const { colors } = useThemeTokens();
  const { t } = useTranslation();

  return (
    <View className="flex-1  ">
      <View className="items-center justify-center pt-10">
        <MyImage source={standingEmoji} width={140} height={140} contentFit="contain" tintColor={colors.muted} />
        <Text className=" text-center text-xl text-muted">{t(message)}</Text>
      </View>
    </View>
  );
}
