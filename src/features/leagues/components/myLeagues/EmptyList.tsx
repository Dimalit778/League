import { Button, CText, MyImage } from '@/components/ui';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import standingEmoji from '@assets/emoji/standing-emoji.png';
import { router } from 'expo-router';
import { View } from 'react-native';

export default function EmptyList() {
  const { colors } = useThemeTokens();
  const { t } = useTranslation();

  return (
    <View className="flex-1  ">
      <View className="flex-row items-center justify-around mt-5">
        <Button title={t('Create League')} onPress={() => router.push('/(app)/(user)/leagues/create-league')} />
        <Button
          title={t('Join League')}
          variant="outline"
          onPress={() => router.push('/(app)/(user)/leagues/join-league')}
        />
      </View>
      <View className="items-center justify-center pt-10">
        <MyImage source={standingEmoji} width={140} height={140} contentFit="contain" tintColor={colors.muted} />
        <CText className=" text-center text-xl text-muted">{t('Create or join a league to get started.')}</CText>
      </View>
    </View>
  );
}
