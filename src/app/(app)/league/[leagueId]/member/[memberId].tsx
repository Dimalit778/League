import MemberDetailsScreen from '@/features/members/screens/MemberDetailsScreen';
import { useLocalSearchParams } from 'expo-router';

export default function MemberDetails() {
  const { memberId } = useLocalSearchParams();
  return <MemberDetailsScreen memberId={memberId as string} />;
}
