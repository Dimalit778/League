import { images } from "@/assets/images";
import { Button, InputField, MyImage, Text } from "@/components";
import AuthScaffold from "@/features/auth/components/auth/AuthScaffold";
import { useAuthActions } from "@/features/auth/hooks/useAuthActions";
import { useTranslation } from "@/hooks/useTranslation";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Linking from "expo-linking";
import { Mail } from "lucide-react-native";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Pressable, View } from "react-native";
import * as yup from "yup";

type EmailFormData = yup.InferType<typeof emailSchema>;

const emailSchema = yup.object().shape({
  email: yup.string().email("Invalid email").required("Email is required"),
});

const ForgotPasswordScreen = () => {
  const { t } = useTranslation();
  const [message, setMessage] = useState<string | null>(null);
  const { sendResetPasswordLink, isLoading, errorMessage, clearError } =
    useAuthActions();

  const emailForm = useForm<EmailFormData>({
    resolver: yupResolver(emailSchema),
    mode: "onChange",
    defaultValues: { email: "" },
  });

  const handleSendResetLink = async (data: EmailFormData) => {
    setMessage(null);
    clearError();
    const result = await sendResetPasswordLink(data.email);

    if (result?.success) {
      setMessage(t("Reset link has been sent to your email"));
    }
  };

  return (
    <AuthScaffold
      title={t("Forgot your password?")}
      description={t(
        "Enter your email address and we'll send you a reset link",
      )}
      fallbackHref="/signIn"
      emblem={
        <MyImage
          source={images.passwordLogo}
          width={140}
          height={140}
          contentFit="contain"
        />
      }
      footer={
        <Pressable
          onPress={() => void Linking.openURL("mailto:support@champoapp.com")}
          accessibilityRole="link"
          accessibilityLabel={t("Contact support")}
          className="items-center justify-center rounded-xl active:opacity-70"
        >
          <Text variant="bodySmall" tone="muted" className="text-center">
            {t("Still need help?")}{" "}
            <Text variant="bodySmall" tone="info">
              {t("Contact support")}
            </Text>
          </Text>
        </Pressable>
      }
    >
      <InputField
        control={emailForm.control}
        name="email"
        placeholder={t("Email")}
        variant="auth"
        autoComplete="email"
        textContentType="emailAddress"
        keyboardType="email-address"
        secureTextEntry={false}
        error={emailForm.formState.errors.email}
        icon={<Mail size={24} color="#AEB8D0" />}
        clearError={clearError}
      />

      <View accessibilityLiveRegion="polite">
        {errorMessage || message ? (
          <Text
            className={`text-center ${errorMessage ? "text-error" : "text-success"}`}
          >
            {errorMessage || message}
          </Text>
        ) : null}
      </View>

      <Button
        variant="primary"
        label={t("Send Reset Link")}
        onPress={emailForm.handleSubmit(handleSendResetLink)}
        loading={isLoading}
        disabled={!emailForm.formState.isValid || isLoading}
        size="lg"
        fullWidth
      />
    </AuthScaffold>
  );
};

export default ForgotPasswordScreen;
