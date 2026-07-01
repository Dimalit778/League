import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
export const Screen = ({
  children,
  className,
  topSafeArea = false,
}: {
  children: React.ReactNode;
  className?: string;
  topSafeArea?: boolean;
}) => {
  const Wrapper = topSafeArea ? SafeAreaView : View;
  return (
    <Wrapper className={`flex-1 bg-background ${className} `} edges={topSafeArea ? ['top', 'bottom'] : []}>
      <View className="flex-1 min-h-0 w-full max-w-lg mx-auto  px-2  bg-background">{children}</View>
    </Wrapper>
  );
};
