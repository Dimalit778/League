import { useThemeTokens } from '@/hooks/useThemeTokens';
import { cn, themes } from '@/lib/nativewind/nativeWind';
import { AlertCircle, Check, HelpCircle } from 'lucide-react-native';
import { useEffect, useRef } from 'react';
import { Animated, Modal, Pressable, StyleSheet, View } from 'react-native';
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
      {buttons.map((button, index) => {
        const outline = button.style === 'cancel';

        return (
          <Pressable
            key={`${button.text}-${index}`}
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
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const color = typeColor[type];

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 300, friction: 20 }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 180, useNativeDriver: true }),
      ]).start();
    } else {
      scaleAnim.setValue(0.95);
      opacityAnim.setValue(0);
    }
  }, [visible, scaleAnim, opacityAnim]);

  // ponytail: Modal portals outside ThemeProvider on web — re-apply CSS vars here
  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onDismiss}>
      <View testID="alert-theme" style={[themes[theme], styles.themeRoot]}>
        <Animated.View testID="alert-overlay" style={[styles.overlay, { opacity: opacityAnim }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onDismiss} />

          <Animated.View
            testID="alert-card"
            style={[
              styles.card,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                transform: [{ scale: scaleAnim }],
              },
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
});
