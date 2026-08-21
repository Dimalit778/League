import { Button } from '@/components';
import type { MemberPrediction } from '@/features/matches/types';
import PredictionForm, {
  type PredictionDraftState,
  type PredictionFormHandle,
} from '@/features/predictions/components/PredictionForm';
import { useTranslation } from '@/hooks/useTranslation';
import { useCallback, useRef, useState } from 'react';
import { View } from 'react-native';

export function MatchPredictionEditor({
  prediction,
  matchId,
  onSaved,
}: {
  prediction?: MemberPrediction;
  matchId: number;
  onSaved?: () => void;
}) {
  const { t } = useTranslation();
  const formRef = useRef<PredictionFormHandle>(null);
  const [draft, setDraft] = useState<PredictionDraftState>({ hasChanges: false, isPending: false });
  const handleDraftChange = useCallback((state: PredictionDraftState) => setDraft(state), []);

  return (
    <View className="gap-2 pt-5">
      <PredictionForm
        ref={formRef}
        prediction={prediction}
        matchId={matchId}
        onSaveSuccess={onSaved}
        onDraftChange={handleDraftChange}
      />

      <Button
        size="md"
        label={t('Save')}
        variant="primary"
        onPress={() => void formRef.current?.save()}
        loading={draft.isPending}
        disabled={!draft.hasChanges || draft.isPending}
      />
    </View>
  );
}
