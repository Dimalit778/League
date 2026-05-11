import { View } from 'react-native';
import { WCMatch } from '../types';
import WCMatchCard from './WCMatchCard';

type Props = {
  matches: WCMatch[];
};

export default function KnockoutMatchesList({ matches }: Props) {
  return (
    <View className="px-2 mt-2">
      {matches.map((m) => (
        <WCMatchCard key={m.id} match={m} layout="row" />
      ))}
    </View>
  );
}
