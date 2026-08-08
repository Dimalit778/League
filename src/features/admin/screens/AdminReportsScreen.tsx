import { BackButton, Badge, Button, Card, Chip, EmptyState, LoadingOverlay, Screen, Text } from '@/components';
import { useAdminContentReports, useModerateContentReport } from '@/features/admin/hooks/useAdmin';
import { ModerationDecision, ReportStatus } from '@/features/moderation/types';
import { useTranslation } from '@/hooks/useTranslation';
import { useIsFocused } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Alert, RefreshControl, ScrollView, View } from 'react-native';

const statusOptions: { value: ReportStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'dismissed', label: 'Dismissed' },
];

const contentLabels: Record<string, string> = {
  nickname: 'Nickname',
  avatar: 'Profile photo',
  league_name: 'League name',
};

const reasonLabels: Record<string, string> = {
  harassment: 'Harassment or bullying',
  hate: 'Hate speech',
  sexual: 'Sexual content',
  violence: 'Violence or threats',
  spam: 'Spam or scam',
  impersonation: 'Impersonation',
  privacy: 'Privacy violation',
  other: 'Other',
};

export default function AdminReportsScreen() {
  const { t } = useTranslation();
  const isFocused = useIsFocused();
  const [status, setStatus] = useState<ReportStatus>('pending');
  const reportsQuery = useAdminContentReports(status);
  const moderateReport = useModerateContentReport();

  const onRefresh = useCallback(() => reportsQuery.refetch(), [reportsQuery]);

  const confirmDecision = (reportId: string, decision: ModerationDecision) => {
    const title =
      decision === 'dismiss'
        ? t('Dismiss report')
        : decision === 'remove_member'
          ? t('Remove member')
          : t('Remove reported content');
    const message =
      decision === 'dismiss'
        ? t('Mark this report as reviewed with no action?')
        : decision === 'remove_member'
          ? t('Remove this member and their predictions from the league?')
          : t('Replace or hide the reported content immediately?');

    Alert.alert(title, message, [
      { text: t('Cancel'), style: 'cancel' },
      {
        text: decision === 'dismiss' ? t('Dismiss') : t('Confirm'),
        style: decision === 'dismiss' ? 'default' : 'destructive',
        onPress: () =>
          moderateReport.mutate(
            { reportId, decision },
            {
              onError: (error) => Alert.alert(t('Error'), error.message),
            },
          ),
      },
    ]);
  };

  if (reportsQuery.isLoading && !reportsQuery.data) return <LoadingOverlay />;

  return (
    <Screen safeArea>
      <BackButton title={t('Content Reports')} />
      <View className="flex-row gap-2 px-4 py-3">
        {statusOptions.map((option) => (
          <Chip
            key={option.value}
            label={t(option.label)}
            variant={status === option.value ? 'selected' : 'default'}
            onPress={() => setStatus(option.value)}
            className="flex-1"
          />
        ))}
      </View>

      <ScrollView
        className="flex-1 px-4"
        refreshControl={
          <RefreshControl
            refreshing={isFocused && reportsQuery.isRefetching}
            onRefresh={onRefresh}
          />
        }
      >
        {reportsQuery.error ? (
          <Text tone="error">{t('Unable to load content reports. Pull to refresh to try again.')}</Text>
        ) : reportsQuery.data?.length === 0 ? (
          <EmptyState variant="empty" title={t('No reports in this queue')} />
        ) : (
          <View className="gap-4 pb-16 pt-2">
            {reportsQuery.data?.map((report) => (
              <Card key={report.id} contentClassName="gap-3">
                <View className="flex-row items-start justify-between gap-3">
                  <View className="min-w-0 flex-1">
                    <Text variant="subtitle">{t(contentLabels[report.content_type] ?? report.content_type)}</Text>
                    <Text variant="bodySmall" tone="muted">
                      {t(reasonLabels[report.reason] ?? report.reason)}
                    </Text>
                  </View>
                  <Badge label={t(report.status === 'pending' ? 'Pending' : report.status === 'resolved' ? 'Resolved' : 'Dismissed')} />
                </View>

                <View className="rounded-xl bg-subtle p-3">
                  <Text variant="caption" tone="muted">{t('Reported content')}</Text>
                  <Text numberOfLines={3}>{report.content_snapshot}</Text>
                </View>

                {report.details ? (
                  <View>
                    <Text variant="caption" tone="muted">{t('Reporter details')}</Text>
                    <Text variant="bodySmall">{report.details}</Text>
                  </View>
                ) : null}

                <View className="gap-1">
                  <Text variant="bodySmall" tone="muted">
                    {t('League')}: {report.league?.name ?? t('Unknown')}
                  </Text>
                  <Text variant="bodySmall" tone="muted">
                    {t('Reported user')}: {report.target?.full_name ?? report.member?.nickname ?? t('Unknown')}
                  </Text>
                  <Text variant="bodySmall" tone="muted">
                    {t('Reported by')}: {report.reporter?.email ?? t('Deleted Player')}
                  </Text>
                  <Text variant="caption" tone="muted">
                    {new Date(report.created_at).toLocaleString()}
                  </Text>
                </View>

                {report.status === 'pending' ? (
                  <View className="gap-2">
                    <View className="flex-row gap-2">
                      <Button
                        label={t('Dismiss')}
                        variant="outline"
                        className="flex-1"
                        onPress={() => confirmDecision(report.id, 'dismiss')}
                        disabled={moderateReport.isPending}
                      />
                      <Button
                        label={t('Remove content')}
                        variant="error"
                        className="flex-1"
                        onPress={() => confirmDecision(report.id, 'remove_content')}
                        disabled={moderateReport.isPending}
                      />
                    </View>
                    {report.league_member_id ? (
                      <Button
                        label={t('Remove member')}
                        variant="outline"
                        fullWidth
                        className="border-error"
                        onPress={() => confirmDecision(report.id, 'remove_member')}
                        disabled={moderateReport.isPending}
                      />
                    ) : null}
                  </View>
                ) : null}
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}
