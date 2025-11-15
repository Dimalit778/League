import { SafeAreaView } from 'react-native-safe-area-context';

const Screen = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return <SafeAreaView className={`flex-1 bg-background ${className}`}>{children}</SafeAreaView>;
};

export default Screen;
