import { ReactNode } from 'react';
import { View } from 'react-native';
import { Edge, SafeAreaView } from 'react-native-safe-area-context';

type ScreenProps = {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  edges?: Edge[];
};

export const Screen = ({ children, className = '', contentClassName = '', edges = [] }: ScreenProps) => {
  return (
    <SafeAreaView edges={edges} className={`flex-1 bg-background ${className}`}>
      <View className={`flex-1 min-h-0 w-full max-w-lg mx-auto bg-background ${contentClassName}`}>{children}</View>
    </SafeAreaView>
  );
};
