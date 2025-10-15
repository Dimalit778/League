import { GoogleLogoIcon } from '@assets/icons';
import { Pressable, Text } from 'react-native';

type Props = {
  label?: string;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'light' | 'dark';
  onPress: () => void;
  className?: string;
};

const GoogleSignInButton = ({
  label = 'Sign in with Google',
  loading,
  disabled,
  onPress,
}: Props) => {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className="h-14 px-4 rounded-full flex-row items-center justify-center gap-x-4 border border-muted"
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <GoogleLogoIcon size={22} />
      <Text className="text-md font-semibold text-text" numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
};

export default GoogleSignInButton;
