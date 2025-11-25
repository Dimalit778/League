import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import { MatchType } from '../../types';

// Live Match Content - Live Events
export default function Live({ match }: { match: MatchType }) {
  // TODO: Replace with actual live events data from API
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
    const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
      goal: 'football',
      'yellow-card': 'alert-circle',
      'red-card': 'alert-circle',
      substitution: 'person-add',
      penalty: 'football',
    };
    return iconMap[type] || 'information-circle';
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
        {events.length === 0 ? (
          <Text className="text-center text-textMuted py-4">No live events yet</Text>
        ) : (
          events.map((event) => (
            <View key={event.id} className="flex-row items-center py-3 border-b border-border/20 last:border-b-0">
              <View className="w-8 h-8 bg-primary/10 rounded-full items-center justify-center mr-3">
                <Ionicons name={getEventIcon(event.type)} size={16} color="#6366F1" />
              </View>

              <View className="flex-1">
                <Text className="text-text font-semibold">{event.player}</Text>
                {event.details && <Text className="text-textMuted text-sm">{event.details}</Text>}
              </View>

              <View className="bg-primary/10 px-3 py-1 rounded-full">
                <Text className="text-primary font-bold text-sm">{event.time}'</Text>
              </View>
            </View>
          ))
        )}
      </View>
    </View>
  );
}
