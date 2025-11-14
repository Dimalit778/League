import { ActivityIndicator, StyleSheet, View } from 'react-native';

const LoadingOverlay = () => {
  return (
    <View style={styles.overlay}>
      <ActivityIndicator size="large" color="orange" />
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 9999,
  },
});

export default LoadingOverlay;
