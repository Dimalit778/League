import React, { useState } from 'react';
import { LayoutChangeEvent, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ScreenProps = {
  children: React.ReactNode;
  className?: string;
};

const Screen = ({ children, className }: ScreenProps) => {
  const [contentHeight, setContentHeight] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  const handleContentSizeChange = (_: number, contentHeight: number) => {
    setContentHeight(contentHeight);
  };

  const handleContainerLayout = (event: LayoutChangeEvent) => {
    setContainerHeight(event.nativeEvent.layout.height);
  };

  const isScrollEnabled =
    contentHeight > containerHeight && containerHeight > 0;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['left', 'right']}>
      <View
        style={{ flex: 1 }}
        className={className}
        onLayout={handleContainerLayout}
      >
        <ScrollView
          scrollEnabled={isScrollEnabled}
          onContentSizeChange={handleContentSizeChange}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default Screen;
