import logo from '@assets/app-icon.png';
import { ActivityIndicator, Image, StyleSheet, View } from 'react-native';

export const LoadingLogo = () => {
  return (
    <View style={styles.overlay}>
      <Image source={logo} resizeMode="contain" style={{ width: 250, height: 250 }} />
      <ActivityIndicator size="large" color="#fff" style={{ marginTop: 20 }} />
    </View>
  );
};
const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0)',
    zIndex: 9999,
  },
});
