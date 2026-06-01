import { LimitModal } from '@/features/subscription/components/LimitModal';
import { useLeagueResolutionGate } from '@/features/subscription/hooks/useLeagueResolutionGate';

export const LeagueResolutionGate = () => {
  const { needsResolution, ownedLeagues, userId, handleUpgrade, isLoading } =
    useLeagueResolutionGate();

  return (
    <LimitModal
      visible={needsResolution}
      leagues={ownedLeagues}
      userId={userId}
      onUpgrade={handleUpgrade}
      isLoading={isLoading}
    />
  );
};
