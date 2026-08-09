import { images } from '@/assets/images';
import { Brand, Button, InputField, Row, Screen, Text } from '@/components';
import AuthLegalLinks from '@/features/auth/components/AuthLegalLinks';
import { useAuthActions } from '@/features/auth/hooks/useAuthActions';
import { useTranslation } from '@/hooks/useTranslation';
import { useIsRTL } from '@/providers/LanguageProvider';
import { MailIcon } from '@assets/icons';
import { yupResolver } from '@hookform/resolvers/yup';
import { ImageBackground } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { ArrowLeft, CircleCheckBig, KeyRound, Mail } from 'lucide-react-native';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import * as yup from 'yup';

type EmailFormData = yup.InferType<typeof emailSchema>;

const emailSchema = yup.object().shape({
  email: yup.string().email('Invalid email').required('Email is required'),
});

const GOLD = '#FFB31A';

function RecoveryEmblem({ size }: { size: number }) {
  return (
    <View
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      className="relative items-center justify-center rounded-full border border-[#FFCC65]/80 bg-[#0A1D33]/95 shadow-lg shadow-[#FFB31A]/30"
      style={{ width: size, height: size }}
    >
      <Mail size={size * 0.48} color="#EAF0FA" strokeWidth={1.6} />
      <View className="absolute bottom-[18%] right-[15%] rounded-full bg-[#0A1D33] p-1">
        <KeyRound size={size * 0.34} color={GOLD} strokeWidth={2.2} />
      </View>
    </View>
  );
}

function RecoveryBackButton({ isRTL }: { isRTL: boolean }) {
  const { t } = useTranslation();

  return (
    <Pressable
      onPress={() => {
        if (router.canGoBack()) router.back();
        else router.replace('/signIn');
      }}
      accessibilityRole="button"
      accessibilityLabel={t('Back')}
      hitSlop={8}
      className="size-12 items-center justify-center rounded-full border border-white/15 bg-[#061326]/70 active:opacity-70"
    >
      <ArrowLeft size={26} color="#F8FAFC" strokeWidth={2} style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }} />
    </Pressable>
  );
}

function WideRecoveryPanel() {
  const { t } = useTranslation();

  return (
    <View className="relative h-full flex-1 overflow-hidden border-r border-white/10">
      <ImageBackground source={images.bgWelcome} style={StyleSheet.absoluteFill} contentFit="cover" />
      <LinearGradient
        colors={['rgba(2,10,23,0.18)', 'rgba(2,10,23,0.52)', 'rgba(2,9,20,0.94)']}
        style={[StyleSheet.absoluteFill, styles.nonInteractive]}
      />
      <View className="flex-1 items-center justify-between px-10 py-12">
        <Brand />
        <View className="items-center gap-8">
          <RecoveryEmblem size={160} />
          <View className="max-w-[520px] items-center gap-3">
            <Text className="text-center font-teko-bold text-[52px] leading-[56px] text-white">
              {t('Get back in the game')}
            </Text>
            <Text className="text-center text-lg leading-7 text-[#B8C3D8]">
              {t("Enter your email address and we'll send you a reset link")}
            </Text>
          </View>
        </View>
        <Text className="text-center text-sm text-[#7F8CA4]">{t('Predict. Compete. Climb.')}</Text>
      </View>
    </View>
  );
}

const SendResetLink = () => {
  const { t } = useTranslation();
  const isRTL = useIsRTL();
  const { width, height } = useWindowDimensions();
  const [message, setMessage] = useState<string | null>(null);
  const { sendResetPasswordLink, isLoading, errorMessage, clearError } = useAuthActions();
  const isWide = width >= 900;
  const isCompactHeight = height < 720;
  const emailForm = useForm<EmailFormData>({
    resolver: yupResolver(emailSchema),
    mode: 'onChange',
    defaultValues: { email: '' },
  });

  const handleSendResetLink = async (data: EmailFormData) => {
    setMessage(null);
    clearError();
    const result = await sendResetPasswordLink(data.email);

    if (result?.success) {
      setMessage(t('If an account exists for this email, a reset link will arrive shortly.'));
    }
  };

  return (
    <View className="flex-1 bg-[#030B18]">
      {!isWide ? (
        <>
          <ImageBackground
            source={images.bgWelcome}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            contentPosition="center"
          />
          <LinearGradient
            colors={['rgba(1,8,20,0.30)', 'rgba(1,9,22,0.76)', 'rgba(2,8,18,0.98)']}
            locations={[0, 0.42, 1]}
            style={[StyleSheet.absoluteFill, styles.nonInteractive]}
          />
        </>
      ) : null}

      <Screen width="full" padding="none" edges={['top', 'bottom']} className="bg-transparent">
        <View className="flex-1" style={{ flexDirection: isWide ? (isRTL ? 'row-reverse' : 'row') : 'column' }}>
          {isWide ? <WideRecoveryPanel /> : null}

          <View
            className={isWide ? 'h-full bg-[#030B18]/95' : 'flex-1'}
            style={{ width: isWide ? Math.min(width * 0.52, 720) : '100%' }}
          >
            <KeyboardAwareScrollView
              bottomOffset={72}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ flexGrow: 1 }}
            >
              <View className="min-h-full items-center px-5 pb-6 pt-3 sm:px-8">
                <View className="w-full max-w-[510px]">
                  <View className="relative min-h-14 justify-center">
                    <View className={isRTL ? 'absolute right-0 z-10' : 'absolute left-0 z-10'}>
                      <RecoveryBackButton isRTL={isRTL} />
                    </View>
                    {!isWide ? <Brand size={isCompactHeight ? 'sm' : 'md'} /> : null}
                  </View>

                  {!isWide && !isCompactHeight ? (
                    <View className="mt-6 items-center">
                      <RecoveryEmblem size={width >= 600 ? 112 : 94} />
                    </View>
                  ) : null}

                  <View className={isCompactHeight ? 'mb-5 mt-5 items-center' : 'mb-7 mt-7 items-center'}>
                    <Text
                      accessibilityRole="header"
                      className="text-center font-teko-bold text-[42px] leading-[46px] text-white sm:text-[48px] sm:leading-[52px]"
                    >
                      {t('Forgot your password?')}
                    </Text>
                    <Text className="mt-2 max-w-[450px] text-center text-base leading-6 text-[#AFBAD0]">
                      {t("Enter your email address and we'll send you a reset link")}
                    </Text>
                  </View>

                  <View
                    className={
                      isWide
                        ? 'rounded-[28px] border border-white/10 bg-[#07172A]/90 p-6 shadow-2xl shadow-black/40'
                        : 'px-1 sm:rounded-[28px] sm:border sm:border-white/10 sm:bg-[#07172A]/75 sm:p-6'
                    }
                  >
                    <View className="gap-5">
                      <InputField
                        control={emailForm.control}
                        name="email"
                        label={t('Email')}
                        placeholder={t('Email')}
                        variant="auth"
                        autoComplete="email"
                        textContentType="emailAddress"
                        keyboardType="email-address"
                        secureTextEntry={false}
                        error={emailForm.formState.errors.email}
                        icon={<MailIcon size={24} color="#AEB8D0" />}
                        clearError={clearError}
                      />

                      <View className="min-h-6 justify-center" accessibilityLiveRegion="polite">
                        {errorMessage || message ? (
                          <Text className={`text-center ${errorMessage ? 'text-error' : 'text-success'}`}>
                            {errorMessage || message}
                          </Text>
                        ) : null}
                      </View>

                      <Button
                        label={t('Send Reset Link')}
                        onPress={emailForm.handleSubmit(handleSendResetLink)}
                        loading={isLoading}
                        disabled={!emailForm.formState.isValid || isLoading}
                        size="lg"
                        fullWidth
                        className="min-h-[58px] rounded-2xl bg-[#FFB31A]"
                      />

                      <Pressable
                        onPress={() => router.replace('/signIn')}
                        accessibilityRole="button"
                        accessibilityLabel={t('Back to Sign In')}
                        className="min-h-12 items-center justify-center rounded-xl px-3 active:opacity-70"
                      >
                        <Text className="text-center text-base font-bold text-[#8AA8FF]">{t('Back to Sign In')}</Text>
                      </Pressable>

                      <Row className="gap-4 rounded-2xl border border-[#29476E] bg-[#0A1B30]/80 p-4">
                        <View className="relative" accessible={false}>
                          <Mail size={38} color="#F4F7FC" strokeWidth={1.6} />
                          <CircleCheckBig size={20} color={GOLD} fill="#0A1B30" style={styles.deliveryCheck} />
                        </View>
                        <Text className="flex-1 text-base leading-6 text-[#DCE4F1]">
                          {t('If an account exists for this email, the link may take a few minutes to arrive.')}
                        </Text>
                      </Row>

                      <Pressable
                        onPress={() => void Linking.openURL('mailto:support@champoapp.com')}
                        accessibilityRole="link"
                        accessibilityLabel={t('Contact support')}
                        className="min-h-11 items-center justify-center rounded-xl px-3 active:opacity-70"
                      >
                        <Text className="text-center text-sm text-[#9EA9BE]">
                          {t('Still need help?')}{' '}
                          <Text className="font-bold text-[#7EA1FF]">{t('Contact support')}</Text>
                        </Text>
                      </Pressable>
                    </View>
                  </View>

                  <View className="mt-5">
                    <AuthLegalLinks />
                  </View>
                </View>
              </View>
            </KeyboardAwareScrollView>
          </View>
        </View>
      </Screen>
    </View>
  );
};

const styles = StyleSheet.create({
  brandSparkle: { position: 'absolute', right: -8, top: -7 },
  deliveryCheck: { position: 'absolute', right: -6, bottom: -5 },
  nonInteractive: { pointerEvents: 'none' },
});

export default SendResetLink;
