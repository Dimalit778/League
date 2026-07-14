import { Text } from '@/components/ui';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/nativeWind';
import { Pressable, View } from 'react-native';

type AuthMode = 'signIn' | 'signUp';

export default function AuthModeToggle({
  mode,
  onModeChange,
}: {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
}) {
  const { t } = useTranslation();

  const options = [
    { key: 'signIn', label: t('Sign In') },
    { key: 'signUp', label: t('Sign Up') },
  ] as const;

  return (
    <View className=" rounded-2xl border border-border  ">
      <View className="flex-row">
        {options.map((option) => {
          const active = mode === option.key;

          return (
            <Pressable
              key={option.key}
              onPress={() => onModeChange(option.key)}
              className={cn(
                'flex-1 items-center justify-center rounded-xl py-2',
                active && 'bg-border border border-muted',
              )}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
            >
              <Text className={cn('text-center', active ? 'text-text' : 'text-muted')}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
