import { Text, View } from 'react-native';

type ErrorProps = {
  error: string | { message: string };
};

const Error = ({ error }: ErrorProps) => {
  return (
    <View className="flex-1 justify-center items-center bg-background">
      <Text className="text-error text-2xl font-bold text-center">
        {typeof error === 'string' ? error : error.message}
      </Text>
    </View>
  );
};

export default Error;
