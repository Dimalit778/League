import { BackButton, Button, InputField, Screen } from '@/components/ui';
import GoogleAuth from '@/features/auth/components/GoogleAuth';
import { useAuthActions } from '@/features/auth/queries/useAuthActions';
import { useThemeTokens } from '@/features/settings/hooks/useThemeTokens';
import { EmailIcon, LockIcon } from '@assets/icons';
import { yupResolver } from '@hookform/resolvers/yup';
import { Link } from 'expo-router';
import { useForm } from 'react-hook-form';
import { Text, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import * as yup from 'yup';

type FormData = yup.InferType<typeof schema>;

const schema = yup.object().shape({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(6, 'Minimum 6 characters').required('Password is required'),
});

const SignIn = () => {
  const { colors } = useThemeTokens();
  const { signIn, isLoading, isError, errorMessage, clearError } = useAuthActions();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange',
  });

  const onSubmit = async (data: FormData) => {
    const { success, error } = await signIn(data.email, data.password);
    if (!success) {
      console.error('Sign in error:', error);
    }
  };

  return (
    <Screen>
      <BackButton />
      <KeyboardAwareScrollView bottomOffset={62} className="flex-1">
        <View className="items-center py-16">
          <Text className=" text-secondary font-nunito-black text-center" style={{ fontSize: 42 }}>
            Welcome Back
          </Text>

          <Text className="text-muted font-nunito-bold ">Sign in to your account</Text>
        </View>

        {/* Form */}
        <View className=" px-5 gap-4">
          <InputField
            control={control}
            name="email"
            placeholder="Email"
            secureTextEntry={false}
            error={errors.email}
            icon={<EmailIcon size={24} color={colors.muted} />}
            clearError={clearError}
          />

          <InputField
            control={control}
            name="password"
            placeholder="Password"
            secureTextEntry
            icon={<LockIcon size={24} color={colors.muted} />}
            error={errors.password}
            clearError={clearError}
          />

          {errorMessage && (
            <View className="">
              <Text className="text-error text-center">{errorMessage}</Text>
            </View>
          )}

          <Button
            title="Log In"
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            disabled={!isValid || isLoading}
            variant="secondary"
            size="lg"
          />
          <View className="flex-row items-center my-4">
            <View className="flex-1 h-px bg-gray-600" />
            <Text className="text-gray-400 mx-2">OR</Text>
            <View className="flex-1 h-px bg-gray-600" />
          </View>

          <GoogleAuth />

          <Text className="text-muted text-center mt-5 ">
            Don't have an account?
            <Link href="/signUp" replace>
              <Text className="text-secondary font-bold">Sign Up</Text>
            </Link>
          </Text>
        </View>
      </KeyboardAwareScrollView>
    </Screen>
  );
};

export default SignIn;
