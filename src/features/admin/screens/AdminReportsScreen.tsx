import { Badge, Button, Card, Chip, LoadingOverlay, Screen, Text } from '@/components';
import {
  AdminCardGrid,
  AdminCollectionSummary,
  AdminEmpty,
  AdminErrorBanner,
  AdminGridItem,
  AdminMeta,
  AdminPageHeader,
} from '@/features/admin/components/AdminUI';
import { ADMIN_CONTENT_CLASS, formatAdminDate } from '@/features/admin/lib/adminUi';
import { useAdminContentReports, useModerateContentReport } from '@/features/admin/hooks/useAdmin';
import { ModerationDecision, ReportStatus } from '@/features/moderation/types';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { useIsFocused } from '@react-navigation/native';
import { ShieldCheck } from 'lucide-react-native';
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
  const { t, language } = useTranslation();
  const { colors } = useThemeTokens();
  const isFocused = useIsFocused();
  const [status, setStatus] = useState<ReportStatus>('pending');
  const reportsQuery = useAdminContentReports(status);
  const moderateReport = useModerateContentReport();

  const onRefresh = useCallback(() => void reportsQuery.refetch(), [reportsQuery]);

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
            { onError: (error) => Alert.alert(t('Error'), error.message) },
          ),
      },
    ]);
  };

  if (reportsQuery.isLoading && !reportsQuery.data) return <LoadingOverlay />;

  return (
    <Screen edges={['bottom']}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            tintColor={colors.primary}
            refreshing={isFocused && reportsQuery.isRefetching}
            onRefresh={onRefresh}
          />
        }
      >
        <View className={ADMIN_CONTENT_CLASS}>
          <AdminPageHeader
            eyebrow={t('Safety')}
            title={t('Content Reports')}
            description={t('Review reported content and take clear, auditable moderation actions.')}
          />

          <View className="mb-4 flex-row gap-2 rounded-2xl border border-border bg-surface p-1.5">
            {statusOptions.map((option) => (
              <Chip
                key={option.value}
                label={t(option.label)}
                variant={status === option.value ? 'selected' : 'default'}
                onPress={() => setStatus(option.value)}
                className="flex-1 border-0"
              />
            ))}
          </View>

          <AdminCollectionSummary
            countLabel={t('{{count}} reports in this queue', { count: reportsQuery.data?.length ?? 0 })}
            badgeLabel={t(status === 'pending' ? 'Needs review' : status === 'resolved' ? 'Resolved' : 'Dismissed')}
          />

          {reportsQuery.error ? (
            <AdminErrorBanner message={t('Unable to load content reports. Pull to refresh to try again.')} />
          ) : reportsQuery.data?.length === 0 ? (
            <AdminEmpty
              icon={ShieldCheck}
              title={t('No reports in this queue')}
              description={status === 'pending' ? t('There is nothing waiting for review.') : undefined}
            />
          ) : (
            <AdminCardGrid>
              {reportsQuery.data?.map((report) => (
                <AdminGridItem key={report.id}>
                  <Card className="h-full" contentClassName="min-h-[390px] gap-4">
                    <View className="flex-row items-start justify-between gap-3">
                      <View className="min-w-0 flex-1">
                        <Text variant="title" size="lg">{t(contentLabels[report.content_type] ?? report.content_type)}</Text>
                        <Text variant="body" size="sm" tone="muted">
                          {t(reasonLabels[report.reason] ?? report.reason)}
                        </Text>
                      </View>
                      <Badge
                        label={t(
                          report.status === 'pending'
                            ? 'Pending'
                            : report.status === 'resolved'
                              ? 'Resolved'
                              : 'Dismissed',
                        )}
                        variant={report.status === 'pending' ? 'warning' : report.status === 'resolved' ? 'success' : 'default'}
                      />
                    </View>

                    <View className="rounded-2xl border border-border bg-subtle p-3">
                      <Text variant="caption" tone="muted">
                        {t('Reported content')}
                      </Text>
                      <Text numberOfLines={3}>{report.content_snapshot}</Text>
                    </View>

                    {report.details ? (
                      <AdminMeta label={t('Reporter details')} value={<Text variant="body" size="sm">{report.details}</Text>} />
                    ) : null}

                    <View className="gap-2">
                      <View className="flex-row gap-4">
                        <AdminMeta label={t('League')} value={report.league?.name ?? t('Unknown')} className="flex-1" />
                        <AdminMeta
                          label={t('Reported user')}
                          value={report.target?.full_name ?? report.member?.nickname ?? t('Unknown')}
                          className="flex-1"
                        />
                      </View>
                      <View className="flex-row gap-4">
                        <AdminMeta
                          label={t('Reported by')}
                          value={report.reporter?.email ?? t('Deleted Player')}
                          ltr
                          className="flex-1"
                        />
                        <AdminMeta
                          label={t('Submitted')}
                          value={formatAdminDate(report.created_at, language)}
                          className="flex-1"
                        />
                      </View>
                    </View>

                    {report.status === 'pending' ? (
                      <View className="mt-auto gap-2 border-t border-border pt-3">
                        <View className="flex-row gap-2">
                          <Button
                            label={t('Dismiss')}
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onPress={() => confirmDecision(report.id, 'dismiss')}
                            disabled={moderateReport.isPending}
                          />
                          <Button
                            label={t('Remove content')}
                            variant="error"
                            size="sm"
                            className="flex-1"
                            onPress={() => confirmDecision(report.id, 'remove_content')}
                            disabled={moderateReport.isPending}
                          />
                        </View>
                        {report.league_member_id ? (
                          <Button
                            label={t('Remove member')}
                            variant="outline"
                            size="sm"
                            fullWidth
                            className="border-error/40"
                            onPress={() => confirmDecision(report.id, 'remove_member')}
                            disabled={moderateReport.isPending}
                          />
                        ) : null}
                      </View>
                    ) : null}
                  </Card>
                </AdminGridItem>
              ))}
            </AdminCardGrid>
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}
