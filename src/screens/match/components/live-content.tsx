import { Match } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

interface LiveContentProps {
  match: Match;
}
export default function LiveContent({ match }: LiveContentProps) {
  const events = [
    {
      id: 1,
      type: 'goal',
      player: 'John Doe',
      details: 'Scored a goal',
      time: '10',
    },
  ];
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'goal':
        return 'football';
      case 'yellow-card':
        return 'alert-circle';
      case 'red-card':
        return 'alert-circle';
      case 'substitution':
        return 'person-add';
      case 'penalty':
        return 'football';
      default:
        return 'information-circle';
    }
  };

  return (
    <View className="bg-surface rounded-2xl overflow-hidden">
      <View className="bg-primary/10 p-4 flex-row items-center">
        <View className="w-10 h-10 bg-primary rounded-full items-center justify-center">
          <Ionicons name="radio" size={20} color="white" />
        </View>
        <Text className="text-text text-xl font-bold ml-3">Live Events</Text>
        <View className="ml-auto bg-red-500 px-3 py-1 rounded-full">
          <Text className="text-white text-xs font-bold">● LIVE</Text>
        </View>
      </View>

      <View className="p-4">
        {events.map((event: any, index: any) => (
          <View key={event.id} className="flex-row items-center py-3 border-b border-border/20 last:border-b-0">
            <View className="w-8 h-8 bg-primary/10 rounded-full items-center justify-center mr-3">
              <Ionicons name={getEventIcon(event.type) as any} size={16} color="#6366F1" />
            </View>

            <View className="flex-1">
              <Text className="text-text font-semibold">{event.player}</Text>
              {event.details && <Text className="text-textMuted text-sm">{event.details}</Text>}
            </View>

            <View className="bg-primary/10 px-3 py-1 rounded-full">
              <Text className="text-primary font-bold text-sm">{event.time}'</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
