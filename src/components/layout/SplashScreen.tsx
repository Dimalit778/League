import logo from '@assets/app-icon.png';
import { ActivityIndicator, Image, StyleSheet, View } from 'react-native';
const SplashScreen = () => {
  return (
    <View style={styles.container}>
      <Image source={logo} style={styles.logo} />
      <ActivityIndicator size="large" color="#6366F1" style={styles.loader} />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 150,
    height: 150,
  },
  loader: {
    marginTop: 20,
  },
});
export default SplashScreen;
