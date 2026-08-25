import { Badge, Button, Card, LoadingOverlay, Screen, Text } from '@/components';
import {
  AdminCardGrid,
  AdminCollectionSummary,
  AdminEmpty,
  AdminErrorBanner,
  AdminGridItem,
  AdminMeta,
  AdminPageHeader,
  AdminSearchField,
} from '@/features/admin/components/AdminUI';
import { ADMIN_CONTENT_CLASS } from '@/features/admin/lib/adminUi';
import { useAddCompetition, useAdminCompetitions, useRemoveCompetition } from '@/features/admin/hooks/useAdmin';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { useIsFocused } from '@react-navigation/native';
import { Image as ExpoImage } from 'expo-image';
import { Plus, SearchX, Trophy, X } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import { Alert, RefreshControl, ScrollView, TextInput, View } from 'react-native';

const initialFormState = {
  id: '',
  name: '',
  area: '',
  code: '',
  flag: '',
  logo: '',
  type: '',
  displayType: 'LEAGUE',
  season: '',
};

type FormState = typeof initialFormState;

const formFields: { key: keyof FormState; label: string; keyboardType?: 'numeric' }[] = [
  { key: 'id', label: 'Competition ID', keyboardType: 'numeric' },
  { key: 'name', label: 'Name' },
  { key: 'area', label: 'Area' },
  { key: 'code', label: 'Code' },
  { key: 'flag', label: 'Flag URL' },
  { key: 'logo', label: 'Logo URL' },
  { key: 'type', label: 'Type (optional)' },
  { key: 'displayType', label: 'Display Type' },
  { key: 'season', label: 'Season (optional)', keyboardType: 'numeric' },
];

const AdminCompetitionsScreen = () => {
  const isFocused = useIsFocused();
  const { t } = useTranslation();
  const { colors } = useThemeTokens();
  const competitionsQuery = useAdminCompetitions();
  const addCompetition = useAddCompetition();
  const removeCompetition = useRemoveCompetition();
  const [form, setForm] = useState<FormState>(initialFormState);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);

  const resetForm = useCallback(() => {
    setForm(initialFormState);
    setValidationError(null);
  }, []);

  const handleChange = useCallback((key: keyof FormState, value: string) => {
    setForm((previous) => ({ ...previous, [key]: value }));
  }, []);

  const handleSubmit = useCallback(() => {
    if (!form.id || !form.name || !form.area || !form.code || !form.flag || !form.logo) {
      setValidationError('ID, name, area, code, flag and logo are required.');
      return;
    }

    const idAsNumber = Number(form.id);
    if (Number.isNaN(idAsNumber)) {
      setValidationError('Competition ID must be a valid number.');
      return;
    }

    const seasonAsNumber = form.season ? Number(form.season) : null;
    if (form.season && Number.isNaN(seasonAsNumber)) {
      setValidationError('Season must be a valid number when provided.');
      return;
    }

    setValidationError(null);
    addCompetition.mutate(
      {
        id: idAsNumber,
        name: form.name.trim(),
        area: form.area.trim(),
        code: form.code.trim(),
        flag: form.flag.trim(),
        logo: form.logo.trim(),
        type: form.type.trim() || 'league',
        currentStage: form.displayType.trim() || null,
        seasonId: seasonAsNumber,
      },
      {
        onSuccess: () => {
          resetForm();
          setShowForm(false);
        },
        onError: (mutationError) =>
          setValidationError(mutationError instanceof Error ? mutationError.message : 'Failed to add competition.'),
      },
    );
  }, [addCompetition, form, resetForm]);

  const handleRemove = useCallback(
    (id: number, name: string) => {
      Alert.alert(t('Remove competition'), t('Are you sure you want to remove {{name}}?', { name }), [
        { text: t('Cancel'), style: 'cancel' },
        { text: t('Remove'), style: 'destructive', onPress: () => removeCompetition.mutate(id) },
      ]);
    },
    [removeCompetition, t],
  );

  const filteredCompetitions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const competitions = competitionsQuery.data ?? [];
    if (!query) return competitions;
    return competitions.filter((competition) =>
      [competition.name, competition.area, competition.code, competition.type]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(query),
    );
  }, [competitionsQuery.data, searchQuery]);

  const isBusy = addCompetition.isPending || removeCompetition.isPending;

  if (competitionsQuery.isLoading && !competitionsQuery.data) return <LoadingOverlay />;

  return (
    <Screen edges={['bottom']}>
      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            tintColor={colors.primary}
            refreshing={isFocused && (competitionsQuery.isLoading || competitionsQuery.isRefetching)}
            onRefresh={() => void competitionsQuery.refetch()}
          />
        }
      >
        <View className={ADMIN_CONTENT_CLASS}>
          <AdminPageHeader
            eyebrow={t('Competition')}
            title={t('Competitions')}
            description={t('Manage the competitions available across leagues and match data.')}
            trailing={
              <Button
                label={showForm ? t('Close form') : t('Add Competition')}
                variant={showForm ? 'outline' : 'primary'}
                size="sm"
                leftIcon={showForm ? <X size={17} color={colors.text} /> : <Plus size={17} color={colors.onPrimary} />}
                onPress={() => {
                  setShowForm((value) => !value);
                  setValidationError(null);
                }}
              />
            }
          />

          {showForm ? (
            <Card variant="elevated" className="mb-6" contentClassName="gap-4 p-4 md:p-6">
              <View>
                <Text variant="title">{t('Add New Competition')}</Text>
                <Text variant="bodySmall" tone="muted" className="mt-1">
                  {t('Required fields are marked by their labels; optional values can be added later.')}
                </Text>
              </View>
              <View className="-mx-1.5 flex-row flex-wrap">
                {formFields.map((field) => (
                  <View key={field.key} className="w-full p-1.5 md:w-1/2">
                    <Text variant="caption" tone="muted" className="mb-1.5 font-semibold">
                      {t(field.label)}
                    </Text>
                    <TextInput
                      value={form[field.key]}
                      onChangeText={(value) => handleChange(field.key, value)}
                      keyboardType={field.keyboardType ?? 'default'}
                      className="min-h-[48px] rounded-xl border border-border bg-background px-3 text-base text-text"
                      placeholder={t(field.label)}
                      placeholderTextColor={colors.muted}
                      editable={!isBusy}
                      autoCapitalize={field.key === 'code' || field.key === 'displayType' ? 'characters' : 'sentences'}
                    />
                  </View>
                ))}
              </View>
              {validationError ? (
                <View className="rounded-xl bg-error/10 p-3">
                  <Text variant="bodySmall" tone="error">
                    {t(validationError)}
                  </Text>
                </View>
              ) : null}
              <View className="flex-row justify-end gap-2">
                <Button label={t('Cancel')} variant="outline" onPress={() => { resetForm(); setShowForm(false); }} />
                <Button
                  label={t('Add Competition')}
                  onPress={handleSubmit}
                  loading={addCompetition.isPending}
                  disabled={isBusy}
                />
              </View>
            </Card>
          ) : null}

          <AdminSearchField
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={t('Search competitions by name, area, or code...')}
          />
          <View className="mt-3">
            <AdminCollectionSummary
              countLabel={t('Showing {{count}} competitions.', { count: filteredCompetitions.length })}
              badgeLabel={searchQuery ? t('Filtered') : undefined}
            />
          </View>

          {competitionsQuery.error ? (
            <AdminErrorBanner message={t('Unable to load competitions. Pull to refresh to try again.')} />
          ) : filteredCompetitions.length === 0 ? (
            <AdminEmpty
              icon={searchQuery ? SearchX : Trophy}
              title={searchQuery ? t('No competitions match your search') : t('No competitions found')}
              description={searchQuery ? t('Try a competition name, area, or code.') : undefined}
            />
          ) : (
            <AdminCardGrid>
              {filteredCompetitions.map((competition) => (
                <AdminGridItem key={competition.id}>
                  <Card className="h-full" contentClassName="min-h-[230px] gap-4">
                    <View className="flex-row items-start gap-3">
                      <View className="h-12 w-12 overflow-hidden rounded-2xl border border-border bg-subtle">
                        {competition.logo ? (
                          <ExpoImage source={{ uri: competition.logo }} style={{ width: 48, height: 48 }} contentFit="contain" />
                        ) : null}
                      </View>
                      <View className="min-w-0 flex-1">
                        <Text variant="subtitle" numberOfLines={1}>
                          {competition.name}
                        </Text>
                        <Text variant="bodySmall" tone="muted" numberOfLines={1}>
                          {competition.area}
                        </Text>
                      </View>
                      <Badge label={competition.code} variant="primary" />
                    </View>

                    <View className="flex-row gap-4">
                      <AdminMeta label={t('Type')} value={competition.type ?? '—'} className="flex-1" />
                      <AdminMeta label={t('Display')} value={competition.currentSeason?.current_stage ?? 'LEAGUE'} className="flex-1" />
                      <AdminMeta label={t('Season')} value={competition.currentSeason?.id ?? '—'} className="flex-1" />
                    </View>

                    <View className="mt-auto flex-row items-end justify-between gap-3 border-t border-border pt-3">
                      <AdminMeta label={t('Competition ID')} value={competition.id} ltr />
                      <Button
                        label={t('Remove')}
                        onPress={() => handleRemove(competition.id, competition.name)}
                        variant="outline"
                        size="sm"
                        className="border-error/40"
                        disabled={isBusy}
                        loading={removeCompetition.isPending && removeCompetition.variables === competition.id}
                      />
                    </View>
                  </Card>
                </AdminGridItem>
              ))}
            </AdminCardGrid>
          )}
        </View>
      </ScrollView>
    </Screen>
  );
};

export default AdminCompetitionsScreen;
