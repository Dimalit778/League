import { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function List() {
  const data = Array.from({ length: 30 }, (_, i) => i + 1);
  const [selectedItem, setSelectedItem] = useState(15);
  const flatListRef = useRef<FlatList<number>>(null);

  const ITEM_WIDTH = 50; // item width (40) + marginHorizontal*2 (5+5)

  const handlePress = (item: number, index: number) => {
    setSelectedItem(item);
    flatListRef.current?.scrollToIndex({
      index,
      animated: true,
      viewPosition: 0.5, // center
    });
  };

  // 👉 Center the initial selected item when the component mounts
  useEffect(() => {
    console.log('useEffect List');
    const index = data.findIndex((i) => i === selectedItem);
    if (index !== -1) {
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index,
          animated: false, // no animation on first load
          viewPosition: 0.5,
        });
      }, 0);
    }
  }, []);

  return (
    <View className="flex-1 justify-center items-center">
      <FlatList
        ref={flatListRef}
        data={data}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.toString()}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={[
              styles.item,
              {
                backgroundColor: selectedItem === item ? 'blue' : 'green',
              },
            ]}
            onPress={() => handlePress(item, index)}
          >
            <Text className="text-white text-lg">{item}</Text>
          </TouchableOpacity>
        )}
        getItemLayout={(_, index) => ({
          length: ITEM_WIDTH,
          offset: ITEM_WIDTH * index,
          index,
        })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
});
