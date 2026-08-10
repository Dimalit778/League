import { useSubscriptionLimits } from '@/hooks/useSubscriptionLimits';
import { useMemo } from 'react';
import { flattenMyLeagues, requiresLeagueActivationResolution } from '../model/leagueActivation';
import { useMyLeagues } from './useLeagues';

/**
 * True when a free-plan user must resolve their active leagues before using
 * the app further — either they hold more active leagues than the plan
 * allows, or (independent of count) one of their active leagues is PRO-only.
 * Shared by useMyLeaguesScreen (renders the picker) and the (league) route
 * guard (redirects to My Leagues instead of the league's own tabs) so both
 * surfaces agree on when resolution is required.
 */
export function useRequiresLeagueActivation(): boolean {
  const { data: myLeagues } = useMyLeagues();
  const { isPro, maxLeagues } = useSubscriptionLimits();

  const allLeagues = useMemo(() => flattenMyLeagues(myLeagues), [myLeagues]);
  const activeCount = allLeagues.filter((league) => league.active).length;
  const hasIneligibleActiveLeague = useMemo(
    () => !isPro && allLeagues.some((league) => league.active && league.league.competition?.is_free === false),
    [allLeagues, isPro],
  );

  return requiresLeagueActivationResolution({ isPro, activeCount, maxLeagues, hasIneligibleActiveLeague });
}
