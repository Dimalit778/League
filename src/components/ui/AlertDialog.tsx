import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useEffect, useRef } from 'react';
import { Animated, Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface AlertDialogProps {
  visible: boolean;
  title: string;
  message?: string;
  buttons: AlertButton[];
  type: 'info' | 'warning' | 'error' | 'success';
  onButtonPress: (button: AlertButton) => void;
  onDismiss: () => void;
}

const isIOS = Platform.OS === 'ios';

// iOS system alert colors — these are fixed UIKit values, not theme tokens
const IOS_COLORS = {
  dark: {
    bg: '#2c2c2e',
    title: '#ffffff',
    message: 'rgba(235,235,245,0.6)',
    divider: 'rgba(84,84,88,1)',
    blue: '#0a84ff',
    red: '#ff453a',
  },
  light: {
    bg: '#ffffff',
    title: '#000000',
    message: 'rgba(60,60,67,0.6)',
    divider: 'rgba(60,60,67,0.36)',
    blue: '#007aff',
    red: '#ff3b30',
  },
};

const iosDialogShadow =
  Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
    },
  }) ?? {};

const getColorForType = (type: string, colors: any) => {
  switch (type) {
    case 'error':
      return colors.error;
    case 'warning':
      return '#f59e0b';
    case 'success':
      return colors.success;
    case 'info':
    default:
      return colors.info;
  }
};

export const AlertDialog = ({ visible, title, message, buttons, type, onButtonPress, onDismiss }: AlertDialogProps) => {
  const { colors, theme } = useThemeTokens();
  const ios = IOS_COLORS[theme];
  const scaleAnim = useRef(new Animated.Value(isIOS ? 0.93 : 0.95)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 300, friction: 20 }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 180, useNativeDriver: true }),
      ]).start();
    } else {
      scaleAnim.setValue(isIOS ? 0.93 : 0.95);
      opacityAnim.setValue(0);
    }
  }, [visible, scaleAnim, opacityAnim]);

  const typeColor = getColorForType(type, colors);

  const handleBackdropPress = () => {
    if (buttons.length <= 1) onDismiss();
  };

  const getIOSButtonColor = (button: AlertButton) => {
    if (button.style === 'destructive') return ios.red;
    return ios.blue;
  };

  const getAndroidButtonColor = (button: AlertButton, isPrimary: boolean) => {
    if (button.style === 'destructive') return colors.error;
    if (button.style === 'cancel') return colors.muted;
    if (isPrimary) return typeColor;
    return colors.text;
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onDismiss}>
      <Animated.View
        className="flex-1 justify-center items-center p-10"
        style={{ backgroundColor: 'rgba(0,0,0,0.5)', opacity: opacityAnim }}
      >
        <Pressable style={StyleSheet.absoluteFillObject} onPress={handleBackdropPress} />

        <Animated.View
          className={
            isIOS ? 'w-[270px] rounded-[14px] overflow-hidden' : 'w-full min-w-[280px] max-w-[400px] rounded-[28px]'
          }
          style={[
            { backgroundColor: isIOS ? ios.bg : colors.surface, transform: [{ scale: scaleAnim }] },
            isIOS ? iosDialogShadow : { elevation: 6 },
          ]}
        >
          <View className={`px-5 pt-5 pb-4 ${isIOS ? 'items-center' : 'items-start'}`}>
            <Text
              className={`font-bold mb-1.5 leading-[22px] ${isIOS ? 'text-[17px] text-center' : 'text-xl text-left'}`}
              style={{ color: isIOS ? ios.title : colors.text }}
            >
              {title}
            </Text>
            {message && (
              <Text
                className={`leading-[18px] ${isIOS ? 'text-[13px] text-center' : 'text-sm text-left'}`}
                style={{ color: isIOS ? ios.message : colors.muted }}
              >
                {message}
              </Text>
            )}
          </View>

          {isIOS ? (
            <View
              className="flex-row min-h-[44px] self-stretch"
              style={{ borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: ios.divider }}
            >
              {buttons.map((button, index) => {
                const isPrimary = !button.style || button.style === 'default';
                return (
                  <Pressable
                    key={index}
                    className="flex-1 items-center justify-center py-3"
                    style={({ pressed }) => [
                      index > 0 && { borderLeftWidth: StyleSheet.hairlineWidth, borderLeftColor: ios.divider },
                      { opacity: pressed ? 0.4 : 1 },
                    ]}
                    onPress={() => onButtonPress(button)}
                  >
                    <Text
                      className={`text-[17px] ${isPrimary || button.style === 'destructive' ? 'font-semibold' : 'font-normal'}`}
                      style={{ color: getIOSButtonColor(button) }}
                    >
                      {button.text}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ) : (
            <View className="flex-row justify-end px-2 pb-2 gap-1">
              {buttons.map((button, index) => {
                const isPrimary = !button.style || button.style === 'default';
                return (
                  <Pressable
                    key={index}
                    className="py-2.5 px-3 rounded"
                    android_ripple={{ color: colors.border, borderless: true }}
                    onPress={() => onButtonPress(button)}
                  >
                    <Text
                      className="text-sm font-semibold"
                      style={{ color: getAndroidButtonColor(button, isPrimary), letterSpacing: 0.4 }}
                    >
                      {button.text.toUpperCase()}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};
