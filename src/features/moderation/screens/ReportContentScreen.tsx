import { Button, Card, Chip, Screen, Text } from '@/components';
import { useGetMember } from '@/features/members/hooks/useMembers';
import { useSubmitContentReport } from '@/features/moderation/hooks/useModeration';
import { ReportContentType, ReportReason } from '@/features/moderation/types';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, TextInput, View } from 'react-native';

const reportReasons: { value: ReportReason; label: string }[] = [
  { value: 'harassment', label: 'Harassment or bullying' },
  { value: 'hate', label: 'Hate speech' },
  { value: 'sexual', label: 'Sexual content' },
  { value: 'violence', label: 'Violence or threats' },
  { value: 'spam', label: 'Spam or scam' },
  { value: 'impersonation', label: 'Impersonation' },
  { value: 'privacy', label: 'Privacy violation' },
  { value: 'other', label: 'Other' },
];

const asString = (value?: string | string[]) => (Array.isArray(value) ? value[0] : value);

export default function ReportContentScreen() {
  const params = useLocalSearchParams<{
    memberId?: string;
    leagueId?: string;
    contentType?: ReportContentType;
  }>();
  const memberId = asString(params.memberId);
  const leagueId = asString(params.leagueId);
  const fixedContentType = asString(params.contentType) as ReportContentType | undefined;
  const { t, isRTL } = useTranslation();
  const { colors } = useThemeTokens();
  const router = useRouter();
  const memberQuery = useGetMember(memberId ?? '');
  const submitReport = useSubmitContentReport();
  const [contentType, setContentType] = useState<ReportContentType>(fixedContentType ?? 'nickname');
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState('');

  const isLeagueReport = fixedContentType === 'league_name';
  const contentOptions = useMemo(
    () => [
      { value: 'nickname' as const, label: t('Nickname'), disabled: false },
      { value: 'avatar' as const, label: t('Profile photo'), disabled: !memberQuery.data?.avatar_url },
    ],
    [memberQuery.data?.avatar_url, t],
  );

  const handleSubmit = () => {
    if (!reason) {
      Alert.alert(t('Report content'), t('Choose a reason for this report.'));
      return;
    }

    submitReport.mutate(
      {
        contentType,
        reason,
        leagueMemberId: isLeagueReport ? null : memberId,
        leagueId,
        details,
      },
      {
        onSuccess: () => {
          Alert.alert(t('Report submitted'), t('Thank you. Our moderation team will review this report.'), [
            { text: t('OK'), onPress: () => router.back() },
          ]);
        },
        onError: (error) => Alert.alert(t('Error'), error.message),
      },
    );
  };

  return (
    <Screen scroll padding="all" bottomInset contentClassName="gap-5">
      <Card variant="soft" contentClassName="gap-2">
        <Text variant="subtitle">{t('Help keep Champo safe')}</Text>
        <Text variant="bodySmall" tone="muted">
          {t('Reports are confidential. The reported user will not see who submitted the report.')}
        </Text>
      </Card>

      <View className="gap-3">
        <Text variant="subtitle">{t('What are you reporting?')}</Text>
        {isLeagueReport ? (
          <Chip label={t('League name')} variant="selected" />
        ) : (
          <View className="flex-row flex-wrap gap-2">
            {contentOptions.map((option) => (
              <Chip
                key={option.value}
                label={option.label}
                variant={option.disabled ? 'disabled' : contentType === option.value ? 'selected' : 'default'}
                onPress={() => setContentType(option.value)}
              />
            ))}
          </View>
        )}
      </View>

      <View className="gap-3">
        <Text variant="subtitle">{t('Reason')}</Text>
        <View className="flex-row flex-wrap gap-2">
          {reportReasons.map((item) => (
            <Chip
              key={item.value}
              label={t(item.label)}
              variant={reason === item.value ? 'selected' : 'default'}
              onPress={() => setReason(item.value)}
            />
          ))}
        </View>
      </View>

      <View className="gap-2">
        <View className="flex-row items-center justify-between">
          <Text variant="subtitle">{t('Additional details')}</Text>
          <Text variant="caption" tone="muted">
            {details.length}/500
          </Text>
        </View>
        <TextInput
          value={details}
          onChangeText={setDetails}
          maxLength={500}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
          textAlign={isRTL ? 'right' : 'left'}
          placeholder={t('Describe what happened (optional)')}
          placeholderTextColor={colors.muted}
          accessibilityLabel={t('Additional report details')}
          className="min-h-32 rounded-2xl border border-border bg-surface p-4 text-text"
          style={{ color: colors.text }}
        />
      </View>

      <Button
        label={t('Submit report')}
        fullWidth
        size="lg"
        onPress={handleSubmit}
        loading={submitReport.isPending}
        disabled={!reason || submitReport.isPending}
      />
    </Screen>
  );
}
