import { LoadingOverlay } from '@/components/layout';
import { BackButton, Button } from '@/components/ui';
import {
  useAddCompetition,
  useAdminCompetitions,
  useRemoveCompetition,
} from '@/hooks/useAdmin';
import { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
const initialFormState = {
  id: '',
  name: '',
  country: '',
  flag: '',
  logo: '',
  type: '',
  season: '',
};

type FormState = typeof initialFormState;

const AdminCompetitions = () => {
  const { data, isLoading, isRefetching, refetch, error } =
    useAdminCompetitions();
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
    if (!form.id || !form.name || !form.country || !form.flag || !form.logo) {
      setValidationError('ID, name, country, flag and logo are required.');
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
        country: form.country.trim(),
        flag: form.flag.trim(),
        logo: form.logo.trim(),
        type: form.type ? form.type.trim() : undefined,
        season: seasonAsNumber ?? undefined,
      },
      {
        onSuccess: () => {
          resetForm();
        },
        onError: (mutationError) => {
          setValidationError(
            mutationError instanceof Error
              ? mutationError.message
              : 'Failed to add competition.'
          );
        },
      }
    );
  }, [
    addCompetition,
    form.country,
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
      Alert.alert(
        'Remove competition',
        `Are you sure you want to remove ${name}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: () => {
              removeCompetition.mutate(id);
            },
          },
        ]
      );
    },
    [removeCompetition]
  );

  const isBusy = useMemo(
    () => addCompetition.isPending || removeCompetition.isPending,
    [addCompetition.isPending, removeCompetition.isPending]
  );

  if (isLoading && !data) {
    return <LoadingOverlay />;
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <BackButton title="Competitions" />
      <ScrollView
        className="flex-1 px-4 pt-4"
        refreshControl={
          <RefreshControl
            refreshing={isLoading || isRefetching}
            onRefresh={onRefresh}
          />
        }
      >
        <View className="bg-surface border border-border rounded-2xl p-4 mb-6">
          <Text className="text-text text-lg font-semibold mb-4">
            Add New Competition
          </Text>
          <View className="space-y-4">
            {[
              { key: 'id', label: 'Competition ID', keyboardType: 'numeric' },
              { key: 'name', label: 'Name' },
              { key: 'country', label: 'Country' },
              { key: 'flag', label: 'Flag URL' },
              { key: 'logo', label: 'Logo URL' },
              { key: 'type', label: 'Type (optional)' },
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
                  onChangeText={(value) =>
                    handleChange(field.key as keyof FormState, value)
                  }
                  keyboardType={
                    field.keyboardType ? field.keyboardType : 'default'
                  }
                  className="bg-background border border-border rounded-xl px-3 py-3 text-text"
                  placeholder={field.label}
                  placeholderTextColor="#888"
                  editable={!isBusy}
                />
              </View>
            ))}
          </View>
          {validationError && (
            <Text className="text-error text-sm mt-3">{validationError}</Text>
          )}
          <View className="mt-4">
            <Button
              title="Add Competition"
              onPress={handleSubmit}
              loading={addCompetition.isPending}
              disabled={isBusy}
            />
          </View>
        </View>

        {error ? (
          <Text className="text-error text-base mb-4">
            Unable to load competitions. Pull to refresh to try again.
          </Text>
        ) : (
          <Text className="text-text text-sm mb-4">
            Showing {data?.length ?? 0} competitions.
          </Text>
        )}

        <View className="space-y-4 pb-16">
          {data?.map((competition) => (
            <View
              key={competition.id}
              className="bg-surface border border-border rounded-2xl p-4"
            >
              <View className="flex-row justify-between items-start mb-3">
                <View className="flex-1 mr-4">
                  <Text className="text-text text-lg font-semibold">
                    {competition.name}
                  </Text>
                  <Text className="text-text/70 text-sm">
                    {competition.country}
                  </Text>
                  <Text className="text-text/50 text-xs">
                    ID: {competition.id}
                  </Text>
                </View>
                <Button
                  title="Remove"
                  onPress={() => handleRemove(competition.id, competition.name)}
                  variant="error"
                  disabled={isBusy}
                  loading={
                    removeCompetition.isPending &&
                    removeCompetition.variables === competition.id
                  }
                />
              </View>

              <View className="flex-row justify-between">
                <View className="flex-1 mr-4">
                  <Text className="text-text/50 text-xs uppercase tracking-wide">
                    Logo URL
                  </Text>
                  <Text className="text-text text-xs" numberOfLines={2}>
                    {competition.logo}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-text/50 text-xs uppercase tracking-wide">
                    Flag URL
                  </Text>
                  <Text className="text-text text-xs" numberOfLines={2}>
                    {competition.flag}
                  </Text>
                </View>
              </View>

              <View className="flex-row justify-between mt-3">
                <View>
                  <Text className="text-text/50 text-xs uppercase tracking-wide">
                    Type
                  </Text>
                  <Text className="text-text text-sm">
                    {competition.type ?? 'N/A'}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-text/50 text-xs uppercase tracking-wide">
                    Season
                  </Text>
                  <Text className="text-text text-sm">
                    {competition.season ?? 'N/A'}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AdminCompetitions;
