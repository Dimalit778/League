import { BackButton, Button, InputField, Screen } from '@/components/ui';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { supabase } from '@/lib/supabase';
import { EyeClosedIcon, EyeOpenIcon, LockIcon } from '@assets/icons';
import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Text, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import * as yup from 'yup';

const passwordSchema = yup.object().shape({
  password: yup.string().min(6, 'Minimum 6 characters').required('Password is required'),
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords must match'),
});

const ResetPasswordScreen = () => {
  const { colors } = useThemeTokens();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordForm = useForm({
    resolver: yupResolver(passwordSchema),
    mode: 'onChange',
  });

  useEffect(() => {
    supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('event', event);
      console.log('session', JSON.stringify(session, null, 2));
      if (event === 'PASSWORD_RECOVERY') {
        const { data, error } = await supabase.auth.updateUser({ password: passwordForm.getValues('password') });
        if (error) {
          console.error(error);
        }
        if (data) {
          console.log('data', JSON.stringify(data, null, 2));
        }
      }
    });
  }, [passwordForm]);
  return (
    <Screen>
      <BackButton />
      <KeyboardAwareScrollView bottomOffset={62} className="flex-1">
        <View className="items-center py-16">
          <Text className="text-secondary font-nunito-black text-center" style={{ fontSize: 42 }}>
            New Password
          </Text>
          <Text className="text-muted font-nunito-bold text-center mt-2">Enter your new password</Text>
        </View>

        <View className="px-5 gap-4">
          <InputField
            control={passwordForm.control}
            name="password"
            placeholder="New Password"
            secureTextEntry={!showPassword}
            error={passwordForm.formState.errors.password}
            icon={<LockIcon size={24} color={colors.muted} />}
            rightIcon={
              showPassword ? (
                <EyeOpenIcon size={24} color={colors.muted} />
              ) : (
                <EyeClosedIcon size={24} color={colors.muted} />
              )
            }
            onRightIconPress={() => setShowPassword(!showPassword)}
            // clearError={clearError}
          />

          <InputField
            control={passwordForm.control}
            name="confirmPassword"
            placeholder="Confirm Password"
            secureTextEntry={!showConfirmPassword}
            error={passwordForm.formState.errors.confirmPassword}
            icon={<LockIcon size={24} color={colors.muted} />}
            rightIcon={
              showConfirmPassword ? (
                <EyeOpenIcon size={24} color={colors.muted} />
              ) : (
                <EyeClosedIcon size={24} color={colors.muted} />
              )
            }
            onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
            // clearError={clearError}
          />

          {/* {errorMessage && (
            <View className="">
              <Text className="text-error text-center">{errorMessage}</Text>
            </View>
          )} */}

          <Button
            title="Save New Password"
            onPress={passwordForm.handleSubmit(() => {})}
            loading={false}
            disabled={!passwordForm.formState.isValid}
            variant="secondary"
            size="lg"
          />
        </View>
      </KeyboardAwareScrollView>
    </Screen>
  );
};

export default ResetPasswordScreen;
