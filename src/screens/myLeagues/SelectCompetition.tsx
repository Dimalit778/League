import { Error, LoadingOverlay } from '@/components/layout';
import { BackButton, Button } from '@/components/ui';

import { useGetCompetitions } from '@/hooks/useCompetitions';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { Tables } from '@/types/database.types';
import { Image as ExpoImage } from 'expo-image';
import { router } from 'expo-router';
import { memo, useState } from 'react';
import { Alert, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Competition = Tables<'competitions'>;

const CompetitionsCard = memo(
  ({
    comp,
    isSelected,
    onSelect,
    colors,
  }: {
    comp: Competition;
    isSelected: boolean;
    onSelect: (comp: Competition) => void;
    colors: any;
  }) => {
    return (
      <TouchableOpacity key={comp.id} onPress={() => onSelect(comp)}>
        <View
          className="flex-row items-center mb-3 p-4 rounded-xl border-2 bg-surface "
          style={{
            borderColor: isSelected ? colors.primary : colors.border,
          }}
        >
          <ExpoImage
            source={comp.flag}
            style={{ width: 48, height: 48 }}
            cachePolicy="memory-disk"
            contentFit="contain"
            transition={120}
            priority="high"
          />
          <View className="flex-1 items-center">
            <Text className="text-sm font-bold mb-1 text-muted">
              {comp.area}
            </Text>
            <Text
              className="text-xl text-center font-bold"
              style={{
                color: isSelected ? colors.primary : colors.text,
              }}
            >
              {comp.name}
            </Text>
          </View>

          <ExpoImage
            source={comp.logo}
            style={{ width: 52, height: 52 }}
            cachePolicy="memory-disk"
            contentFit="contain"
            transition={120}
            priority="high"
          />
        </View>
      </TouchableOpacity>
    );
  }
);

const SelectCompetitionScreen = () => {
  const [selectedCompetition, setSelectedCompetition] =
    useState<Competition | null>(null);
  const { colors } = useThemeTokens();

  const { data: competitions, isLoading, error } = useGetCompetitions();

  const handleContinue = () => {
    if (!selectedCompetition) {
      Alert.alert('Error', 'Please select a competition to continue.');
      return;
    }
    const competitionId = selectedCompetition?.id;
    const leagueLogo = selectedCompetition?.logo;

    router.push({
      pathname: '/(app)/(public)/myLeagues/create-league',
      params: {
        competitionId: competitionId,
        leagueLogo: leagueLogo,
      },
    });
  };

  if (error) return <Error error={error} />;

  if (isLoading) return <LoadingOverlay />;
  return (
    <SafeAreaView className="flex-1 bg-background ">
      <BackButton title="Select a Competition" />

      <FlatList
        data={competitions}
        renderItem={({ item }) => (
          <CompetitionsCard
            comp={item}
            isSelected={selectedCompetition?.id === item.id}
            onSelect={setSelectedCompetition}
            colors={colors}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        style={{ flex: 1, padding: 10 }}
        getItemLayout={(_, index) => ({
          length: 100,
          offset: 100 * index,
          index,
        })}
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
          autoscrollToTopThreshold: 10,
        }}
        legacyImplementation={false}
        disableVirtualization={false}
      />

      <View className="p-3">
        <Button
          title="Continue"
          onPress={handleContinue}
          variant="primary"
          disabled={!selectedCompetition}
          size="lg"
          loading={isLoading}
        />
      </View>
    </SafeAreaView>
  );
};

export default SelectCompetitionScreen;
