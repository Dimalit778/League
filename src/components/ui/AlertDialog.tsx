import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useEffect, useRef } from 'react';
import { Animated, Dimensions, Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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

const getIconForType = (type: string) => {
  switch (type) {
    case 'error':
      return '❌';
    case 'warning':
      return '⚠️';
    case 'success':
      return '✅';
    case 'info':
    default:
      return 'ℹ️';
  }
};

const getColorForType = (type: string, colors: any) => {
  switch (type) {
    case 'error':
      return colors.error;
    case 'warning':
      return '#f59e0b'; // amber-500
    case 'success':
      return colors.success;
    case 'info':
    default:
      return colors.secondary;
  }
};

export const AlertDialog = ({ visible, title, message, buttons, type, onButtonPress, onDismiss }: AlertDialogProps) => {
  const { colors, fonts } = useThemeTokens();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, scaleAnim, opacityAnim]);

  const typeColor = getColorForType(type, colors);
  const icon = getIconForType(type);

  // Handle single button case (just dismiss on backdrop tap)
  const handleBackdropPress = () => {
    if (buttons.length <= 1) {
      onDismiss();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onDismiss}>
      <Animated.View style={[styles.overlay, { opacity: opacityAnim }]}>
        <TouchableOpacity style={StyleSheet.absoluteFillObject} activeOpacity={1} onPress={handleBackdropPress} />
        <Animated.View
          style={[
            styles.dialog,
            {
              backgroundColor: colors.background,
              borderColor: colors.border,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Header with icon */}
          <View style={styles.header}>
            <View style={[styles.iconContainer, { backgroundColor: typeColor + '15' }]}>
              <View style={[styles.iconInner, { backgroundColor: typeColor + '25' }]}>
                <Text style={[styles.icon, { color: typeColor }]}>{icon}</Text>
              </View>
            </View>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={[styles.title, { color: colors.text, fontFamily: fonts.nunitoBold }]}>{title}</Text>
            {message && (
              <Text style={[styles.message, { color: colors.muted, fontFamily: fonts.nunito }]}>{message}</Text>
            )}
          </View>

          {/* Buttons */}
          <View
            style={[
              styles.buttonContainer,
              buttons.length === 1 ? styles.singleButtonContainer : styles.multiButtonContainer,
            ]}
          >
            {buttons.map((button, index) => {
              const isDestructive = button.style === 'destructive';
              const isCancel = button.style === 'cancel';
              const isPrimary = !isCancel && (buttons.length === 1 || index === buttons.length - 1);

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.button,
                    buttons.length === 1 ? styles.singleButton : styles.multiButton,
                    isCancel && styles.cancelButton,
                    isPrimary &&
                      !isCancel && [
                        styles.primaryButton,
                        { backgroundColor: isDestructive ? colors.error : typeColor },
                      ],
                    isCancel && {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => onButtonPress(button)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      { fontFamily: fonts.nunitoBold },
                      isPrimary && !isCancel && styles.primaryButtonText,
                      isCancel && { color: colors.text },
                    ]}
                  >
                    {button.text}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  dialog: {
    borderRadius: 20,
    minWidth: Math.min(320, screenWidth - 48),
    maxWidth: 400,
    width: '100%',
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 8,
        },
        shadowOpacity: 0.25,
        shadowRadius: 20,
      },
      android: {
        elevation: 12,
      },
      web: {
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
    }),
  },
  header: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 8,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  iconInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 24,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
    lineHeight: 26,
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    opacity: 0.8,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  singleButtonContainer: {
    alignItems: 'center',
  },
  multiButtonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    minHeight: 48,
  },
  singleButton: {
    minWidth: 120,
  },
  multiButton: {
    flex: 1,
  },
  cancelButton: {
    backgroundColor: 'transparent',
  },
  primaryButton: {
    borderColor: 'transparent',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  primaryButtonText: {
    color: 'white',
  },
});
