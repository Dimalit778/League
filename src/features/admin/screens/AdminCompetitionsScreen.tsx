import { LoadingOverlay, Screen } from '@/components/layout';
import { BackButton, Button, Card, Text } from '@/components/ui';
import { useAddCompetition, useAdminCompetitions, useRemoveCompetition } from '@/features/admin/hooks/useAdmin';
import { useIsFocused } from '@react-navigation/native';
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

const AdminCompetitionsScreen = () => {
  const isFocused = useIsFocused();
  const { data, isLoading, isRefetching, refetch, error } = useAdminCompetitions();
  const addCompetition = useAddCompetition();
  const removeCompetition = useRemoveCompetition();

  const [form, setForm] = useState<FormState>(initialFormState);
  const [validationError, setValidationError] = useState<string | null>(null);

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const resetForm = useCallback(() => {
    setForm(initialFormState);
    setValidationError(null);
  }, []);

  const handleChange = useCallback((key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
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
        current_stage: form.displayType.trim() || null,
        season_id: seasonAsNumber ?? undefined,
      },
      {
        onSuccess: () => {
          resetForm();
        },
        onError: (mutationError) => {
          setValidationError(mutationError instanceof Error ? mutationError.message : 'Failed to add competition.');
        },
      },
    );
  }, [
    addCompetition,
    form.area,
    form.code,
    form.displayType,
    form.flag,
    form.id,
    form.logo,
    form.name,
    form.season,
    form.type,
    resetForm,
  ]);

  const handleRemove = useCallback(
    (id: number, name: string) => {
      Alert.alert('Remove competition', `Are you sure you want to remove ${name}?`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            removeCompetition.mutate(id);
          },
        },
      ]);
    },
    [removeCompetition],
  );

  const isBusy = useMemo(
    () => addCompetition.isPending || removeCompetition.isPending,
    [addCompetition.isPending, removeCompetition.isPending],
  );

  if (isLoading && !data) {
    return <LoadingOverlay />;
  }

  return (
    <Screen safeArea>
      <BackButton title="Competitions" />
      <ScrollView
        className="flex-1 px-4 pt-4"
        refreshControl={<RefreshControl refreshing={isFocused && (isLoading || isRefetching)} onRefresh={onRefresh} />}
      >
        <Card className="mb-6">
          <Text className="text-text text-lg font-semibold mb-4">Add New Competition</Text>
          <View className="space-y-4">
            {[
              { key: 'id', label: 'Competition ID', keyboardType: 'numeric' },
              { key: 'name', label: 'Name' },
              { key: 'area', label: 'Area' },
              { key: 'code', label: 'Code' },
              { key: 'flag', label: 'Flag URL' },
              { key: 'logo', label: 'Logo URL' },
              { key: 'type', label: 'Type (optional)' },
              { key: 'displayType', label: 'Display Type' },
              {
                key: 'season',
                label: 'Season (optional)',
                keyboardType: 'numeric',
              },
            ].map((field) => (
              <View key={field.key}>
                <Text className="text-text text-sm mb-1">{field.label}</Text>
                <TextInput
                  value={form[field.key as keyof FormState]}
                  onChangeText={(value) => handleChange(field.key as keyof FormState, value)}
                  keyboardType={field.keyboardType === 'numeric' ? 'numeric' : 'default'}
                  className="bg-background border border-border rounded-xl px-3 py-3 text-text"
                  placeholder={field.label}
                  placeholderTextColor="#888"
                  editable={!isBusy}
                />
              </View>
            ))}
          </View>
          {validationError && <Text className="text-error text-sm mt-3">{validationError}</Text>}
          <View className="mt-4">
            <Button
              label="Add Competition"
              onPress={handleSubmit}
              loading={addCompetition.isPending}
              disabled={isBusy}
            />
          </View>
        </Card>

        {error ? (
          <Text className="text-error text-base mb-4">
            Unable to load competitions. Pull to refresh to try again.
          </Text>
        ) : (
          <Text className="text-text text-sm mb-4">Showing {data?.length ?? 0} competitions.</Text>
        )}

        <View className="space-y-4 pb-16">
          {data?.map((competition) => (
            <Card key={competition.id}>
              <View className="flex-row justify-between items-start mb-3">
                <View className="flex-1 mr-4">
                  <Text className="text-text text-lg font-semibold">{competition.name}</Text>
                  <Text className="text-text/70 text-sm">{competition.area}</Text>
                  <Text className="text-text/50 text-xs">ID: {competition.id}</Text>
                </View>
                <Button
                  label="Remove"
                  onPress={() => handleRemove(competition.id, competition.name)}
                  variant="error"
                  disabled={isBusy}
                  loading={removeCompetition.isPending && removeCompetition.variables === competition.id}
                />
              </View>

              <View className="flex-row justify-between">
                <View className="flex-1 mr-4">
                  <Text className="text-text/50 text-xs uppercase tracking-wide">Logo URL</Text>
                  <Text className="text-text text-xs" numberOfLines={2}>
                    {competition.logo}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-text/50 text-xs uppercase tracking-wide">Flag URL</Text>
                  <Text className="text-text text-xs" numberOfLines={2}>
                    {competition.flag}
                  </Text>
                </View>
              </View>

              <View className="flex-row justify-between mt-3">
                <View>
                  <Text className="text-text/50 text-xs uppercase tracking-wide">Type</Text>
                  <Text className="text-text text-sm">{competition.type ?? 'N/A'}</Text>
                </View>
                <View>
                  <Text className="text-text/50 text-xs uppercase tracking-wide">Display</Text>
                  <Text className="text-text text-sm">{competition.current_stage ?? 'LEAGUE'}</Text>
                </View>
                <View className="items-end">
                  <Text className="text-text/50 text-xs uppercase tracking-wide">Season</Text>
                  <Text className="text-text text-sm">{competition.season_id ?? 'N/A'}</Text>
                </View>
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
};

export default AdminCompetitionsScreen;
