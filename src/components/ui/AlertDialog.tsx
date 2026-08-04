import { useThemeTokens } from '@/hooks/useThemeTokens';
import { cn, themes } from '@/lib/nativewind/nativeWind';
import { AlertCircle, Check, HelpCircle } from 'lucide-react-native';
import { useEffect } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { Text } from './Text';

interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

type AlertType = 'info' | 'warning' | 'success';

interface AlertDialogProps {
  visible: boolean;
  title: string;
  message?: string;
  buttons: AlertButton[];
  type: AlertType;
  onButtonPress: (button: AlertButton) => void;
  onDismiss: () => void;
}

const typeIcon = {
  info: HelpCircle,
  warning: AlertCircle,
  success: Check,
} as const;

const typeColor = {
  info: '#007AFF',
  warning: '#FF3B30',
  success: '#34C759',
} as const;

function AlertHeader({ title, type, color }: { title: string; type: AlertType; color: string }) {
  const Icon = typeIcon[type];

  return (
    <View className="gap-3">
      <View
        className="items-center justify-center self-center rounded-full p-3"
        style={{ backgroundColor: `${color}22` }}
      >
        <View className="h-14 w-14 items-center justify-center rounded-full" style={{ backgroundColor: color }}>
          <Icon size={28} color="#FFFFFF" strokeWidth={2.4} />
        </View>
      </View>

      <Text variant="title" className="px-2 text-center">
        {title}
      </Text>
    </View>
  );
}

function AlertMessage({ message }: { message: string }) {
  return (
    <Text variant="body" tone="muted" className="px-1 text-center">
      {message}
    </Text>
  );
}

function AlertButtons({
  buttons,
  color,
  onButtonPress,
}: {
  buttons: AlertButton[];
  color: string;
  onButtonPress: (button: AlertButton) => void;
}) {
  return (
    <View className="mt-3 w-full flex-row gap-3">
      {buttons.map((button) => {
        const outline = button.style === 'cancel';

        return (
          <Pressable
            key={`${button.style ?? 'default'}:${button.text}`}
            className={`min-h-12 flex-1 items-center justify-center rounded-xl px-3 py-3 active:opacity-70 ${
              outline ? 'border border-border' : ''
            }`}
            style={{ backgroundColor: outline ? 'transparent' : color }}
            onPress={() => onButtonPress(button)}
          >
            <Text variant="body" className={cn('text-center font-medium', outline ? 'text-text' : 'text-white')}>
              {button.text}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export const AlertDialog = ({ visible, title, message, buttons, type, onButtonPress, onDismiss }: AlertDialogProps) => {
  const { colors, theme } = useThemeTokens();
  const scaleAnim = useSharedValue(0.95);
  const opacityAnim = useSharedValue(0);
  const color = typeColor[type];

  const overlayAnimatedStyle = useAnimatedStyle(() => ({ opacity: opacityAnim.value }));
  const cardAnimatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scaleAnim.value }] }));

  useEffect(() => {
    if (visible) {
      scaleAnim.value = withSpring(1, { stiffness: 300, damping: 20 });
      opacityAnim.value = withTiming(1, { duration: 180 });
    } else {
      scaleAnim.value = 0.95;
      opacityAnim.value = 0;
    }
  }, [visible, scaleAnim, opacityAnim]);

  // ponytail: Modal portals outside ThemeProvider on web — re-apply CSS vars here
  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onDismiss}>
      <View testID="alert-theme" style={[themes[theme], styles.themeRoot]}>
        <Animated.View testID="alert-overlay" style={[styles.overlay, overlayAnimatedStyle]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onDismiss} />

          <Animated.View
            testID="alert-card"
            style={[
              styles.card,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
              cardAnimatedStyle,
            ]}
          >
            <AlertHeader title={title} type={type} color={color} />
            {message ? <AlertMessage message={message} /> : null}
            <AlertButtons buttons={buttons} color={color} onButtonPress={onButtonPress} />
          </Animated.View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  themeRoot: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  card: {
    width: '100%',
    maxWidth: 360,
    gap: 24,
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    boxShadow: '0 12px 24px rgba(0, 0, 0, 0.12)',
  },
});
