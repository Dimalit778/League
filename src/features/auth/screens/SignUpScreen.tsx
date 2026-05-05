import { BackButton, Button, CText, InputField, Screen } from '@/components/ui';
import GoogleAuth from '@/features/auth/components/GoogleAuth';
import { useAuthActions } from '@/features/auth/hooks/useAuthActions';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { EmailIcon, EyeClosedIcon, EyeOpenIcon, LockIcon, UserIcon } from '@assets/icons';
import { yupResolver } from '@hookform/resolvers/yup';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import * as yup from 'yup';
const schema = yup.object().shape({
  email: yup.string().email('Please enter a valid email address').required('Email is required'),
  password: yup.string().min(6, 'Minimum 6 characters').required('Password is required'),
  fullname: yup.string().required('Full name is required').min(3, 'Full name must be at least 3 characters'),
});
type FormData = yup.InferType<typeof schema>;

const SignUpScreen = () => {
  const { t } = useTranslation();
  const { signUp, isLoading, errorMessage } = useAuthActions();
  const { colors } = useThemeTokens();
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange',
  });
  const onSubmit = async (form: FormData) => {
    const email = form.email.trim();
    const password = form.password.trim();
    const fullname = form.fullname.trim();

    const result = await signUp(email, password, fullname);

    if (result.success) {
      router.push({
        pathname: '/verifyEmail',
        params: { email },
      });
    }
  };

  return (
    <Screen withSafeArea>
      <BackButton />
      <KeyboardAwareScrollView bottomOffset={62} className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="items-center py-16">
          <CText variant="hero" className="text-secondary">
            {t('Create account')}
          </CText>
          <CText variant="caption" className="text-muted ">
            {t('Sign up to get started')}
          </CText>
        </View>

        <View className=" px-5 gap-4">
          <InputField
            control={control}
            name="fullname"
            placeholder={t('Full Name')}
            icon={<UserIcon size={24} color={colors.muted} />}
            error={errors.fullname}
          />

          <InputField
            control={control}
            name="email"
            placeholder={t('Email')}
            icon={<EmailIcon size={24} color={colors.muted} />}
            error={errors.email}
          />
          <InputField
            control={control}
            name="password"
            placeholder={t('Password')}
            secureTextEntry={!showPassword}
            icon={<LockIcon size={24} color={colors.muted} />}
            error={errors.password}
            onRightIconPress={() => setShowPassword(!showPassword)}
            rightIcon={
              showPassword ? (
                <EyeOpenIcon size={18} color={colors.muted} />
              ) : (
                <EyeClosedIcon size={18} color={colors.muted} />
              )
            }
          />
          {errorMessage && (
            <CText variant="small" className="text-error text-center">
              {errorMessage}
            </CText>
          )}

          <Button
            title={t('Sign Up')}
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            disabled={!isValid || isLoading}
            variant="secondary"
            size="lg"
          />
          <View className="flex-row items-center my-4">
            <View className="flex-1 h-px bg-gray-600" />
            <CText variant="caption" className="text-gray-400 mx-2">
              {t('OR')}
            </CText>
            <View className="flex-1 h-px bg-gray-600" />
          </View>
          <GoogleAuth isLoading={isGoogleLoading} setIsLoading={setIsGoogleLoading} />
          <View className="flex-row items-center justify-center mt-5 gap-2 ">
            <CText variant="caption" className="text-muted">
              {t('Already have an account?')}
            </CText>
            <Link href="/signIn" replace>
              <CText variant="caption" className="text-secondary ">
                {t('Sign In')}
              </CText>
            </Link>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </Screen>
  );
};

export default SignUpScreen;
