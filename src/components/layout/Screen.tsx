import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
export const Screen = ({
  children,
  className,
  withSafeArea = false,
}: {
  children: React.ReactNode;
  className?: string;
  withSafeArea?: boolean;
}) => {
  const Wrapper = withSafeArea ? SafeAreaView : View;
  return (
    <Wrapper className={`flex-1 bg-background ${className} `} edges={withSafeArea ? ['top', 'bottom'] : []}>
      <View className="flex-1 min-h-0 w-full max-w-lg mx-auto  px-2  bg-background">{children}</View>
    </Wrapper>
  );
};
