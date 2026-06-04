import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useEffect, useRef } from 'react';
import { Animated, Dimensions, Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

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

const { width: screenWidth } = Dimensions.get('window');
const isIOS = Platform.OS === 'ios';

// iOS system alert colors — these are fixed UIKit values, not theme tokens
const IOS_COLORS = {
  dark: {
    bg: '#2c2c2e',
    title: '#ffffff',
    message: 'rgba(235,235,245,0.6)',
    divider: 'rgba(84,84,88,0.65)',
    blue: '#0a84ff',
    red: '#ff453a',
    cancel: '#ffffff',
  },
  light: {
    bg: '#ffffff',
    title: '#000000',
    message: 'rgba(60,60,67,0.6)',
    divider: 'rgba(60,60,67,0.36)',
    blue: '#007aff',
    red: '#ff3b30',
    cancel: '#000000',
  },
};

const getColorForType = (type: string, colors: any) => {
  switch (type) {
    case 'error': return colors.error;
    case 'warning': return '#f59e0b';
    case 'success': return colors.success;
    case 'info':
    default: return colors.secondary;
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

  const getIOSButtonColor = (button: AlertButton, isPrimary: boolean) => {
    if (button.style === 'destructive') return ios.red;
    if (button.style === 'cancel') return ios.cancel;
    if (isPrimary) return ios.blue;
    return ios.blue;
  };

  const getAndroidButtonColor = (button: AlertButton, isPrimary: boolean) => {
    if (button.style === 'destructive') return colors.error;
    if (button.style === 'cancel') return colors.muted;
    if (isPrimary) return typeColor;
    return colors.text;
  };

  const dialogBg = isIOS ? ios.bg : colors.surface;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onDismiss}>
      <Animated.View style={[styles.overlay, { opacity: opacityAnim }]}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={handleBackdropPress} />
        <Animated.View
          style={[
            styles.dialog,
            isIOS ? styles.iosDialog : styles.androidDialog,
            { backgroundColor: dialogBg, transform: [{ scale: scaleAnim }] },
          ]}
        >
          <View style={styles.content}>
            <Text style={[styles.title, { color: isIOS ? ios.title : colors.text }]}>{title}</Text>
            {message && (
              <Text style={[styles.message, { color: isIOS ? ios.message : colors.muted }]}>{message}</Text>
            )}
          </View>

          {isIOS ? (
            <View style={[styles.iosButtonContainer, { borderTopColor: ios.divider }]}>
              {buttons.map((button, index) => {
                const isPrimary = !button.style || button.style === 'default';
                return (
                  <Pressable
                    key={index}
                    style={({ pressed }) => [
                      styles.iosButton,
                      index > 0 && { borderLeftWidth: StyleSheet.hairlineWidth, borderLeftColor: ios.divider },
                      { opacity: pressed ? 0.4 : 1 },
                    ]}
                    onPress={() => onButtonPress(button)}
                  >
                    <Text
                      style={[
                        styles.iosButtonText,
                        { color: getIOSButtonColor(button, isPrimary) },
                        (isPrimary || button.style === 'destructive') && styles.iosButtonTextBold,
                      ]}
                    >
                      {button.text}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ) : (
            <View style={styles.androidButtonContainer}>
              {buttons.map((button, index) => {
                const isPrimary = !button.style || button.style === 'default';
                return (
                  <Pressable
                    key={index}
                    style={styles.androidButton}
                    android_ripple={{ color: colors.border, borderless: true }}
                    onPress={() => onButtonPress(button)}
                  >
                    <Text style={[styles.androidButtonText, { color: getAndroidButtonColor(button, isPrimary) }]}>
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

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  dialog: {
    width: Math.min(270, screenWidth - 80),
  },
  iosDialog: {
    borderRadius: 14,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
    }),
  },
  androidDialog: {
    borderRadius: 28,
    minWidth: Math.min(280, screenWidth - 80),
    maxWidth: 400,
    width: '100%',
    elevation: 6,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    alignItems: isIOS ? 'center' : 'flex-start',
  },
  title: {
    fontSize: isIOS ? 17 : 20,
    fontWeight: '700',
    marginBottom: 6,
    textAlign: isIOS ? 'center' : 'left',
    lineHeight: 22,
  },
  message: {
    fontSize: isIOS ? 13 : 14,
    lineHeight: 18,
    textAlign: isIOS ? 'center' : 'left',
  },
  iosButtonContainer: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    minHeight: 44,
  },
  iosButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  iosButtonText: {
    fontSize: 17,
    fontWeight: '400',
  },
  iosButtonTextBold: {
    fontWeight: '600',
  },
  androidButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 8,
    paddingBottom: 8,
    gap: 4,
  },
  androidButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  androidButtonText: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
});
