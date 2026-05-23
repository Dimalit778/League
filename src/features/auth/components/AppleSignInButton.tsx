import { CText } from '@/components/ui';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';

type Props = {
  label?: string;
  loading?: boolean;
  disabled?: boolean;
  onPress: () => void;
};

const AppleSignInButton = ({ label = 'Sign in with Apple', loading, disabled, onPress }: Props) => {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className="h-14 px-4 rounded-full flex-row items-center justify-center gap-x-3 bg-black border border-black"
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View className="w-[22px] items-center justify-center">
        <Ionicons name="logo-apple" size={22} color="#fff" />
      </View>
      <CText className="text-md font-semibold text-white" numberOfLines={1}>
        {label}
      </CText>
    </Pressable>
  );
};

export default AppleSignInButton;
