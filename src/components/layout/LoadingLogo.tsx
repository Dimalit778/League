import logo from '@assets/app-icon.png';
import { ActivityIndicator, Image, View } from 'react-native';

export const LoadingLogo = () => {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
        zIndex: 9999,
      }}
    >
      <Image
        source={logo}
        resizeMode="contain"
        style={{ width: 250, height: 250 }}
      />
      <ActivityIndicator size="large" color="#fff" style={{ marginTop: 20 }} />
    </View>
  );
};
