import { formatErrorForUser } from '@/utils/networkErrorHandler';
import { Text, View } from 'react-native';

type ErrorProps = {
  error: string | Error | { message: string };
};

const Error = ({ error }: ErrorProps) => {
  const errorMessage =
    typeof error === 'string'
      ? error
      : formatErrorForUser(
          error && typeof error === 'object' && 'message' in error
            ? error
            : { message: String(error?.message || error || 'Unknown error') }
        );

  return (
    <View className="flex-1 justify-center items-center bg-background px-6">
      <Text className="text-error text-4xl mb-4">⚠️</Text>
      <Text className="text-error text-2xl font-bold text-center">
        {errorMessage}
      </Text>
    </View>
  );
};

export default Error;
