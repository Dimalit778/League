import { useMemberStore } from '@/store/MemberStore';
import { Tables } from '@/types/database.types';

type Member = Tables<'league_members'>;
type League = Tables<'leagues'> & { competition: Tables<'competitions'> };

export const useStoreData = (): { member: Member; league: League } => {
  const member = useMemberStore((s) => s.member);
  const league = useMemberStore((s) => s.league);

  if (!member) {
    throw new Error('Member is required but missing. Did you forget to initialize or guard this route?');
  }

  if (!league) {
    throw new Error('League is required but missing. Did you forget to initialize or guard this route?');
  }

  return { member, league };
};
