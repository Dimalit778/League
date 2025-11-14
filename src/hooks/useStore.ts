import { useStoreData } from '@/store/store';

export const useMember = () => {
  const { member } = useStoreData();
  return member;
};

export const useLeague = () => {
  const { league } = useStoreData();
  return league;
};

export const useMemberAndLeague = () => {
  return useStoreData();
};
