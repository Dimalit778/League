import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe, type Appearance } from '@stripe/stripe-js';
import { useRef } from 'react';
import { ActivityIndicator, Platform, Pressable, Text, View } from 'react-native';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { useState } from 'react';

const publishableKey = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '';
// stripePromise is created once outside any component to avoid re-creating on every render
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

type PayFormProps = {
  onSuccess: () => void;
  onError: (message: string) => void;
};

function PayForm({ onSuccess, onError }: PayFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { t } = useTranslation();
  const { colors } = useThemeTokens();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handlePay = async () => {
    if (!stripe || !elements) return;

    setLoading(true);
    setErrorMsg(null);

    // Confirm the payment — Stripe handles 3DS etc automatically
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // After 3DS redirect, Stripe will come back here
        return_url: typeof window !== 'undefined'
          ? `${window.location.origin}/subscription?payment=success`
          : '',
      },
      // Suppress redirect when no redirect is needed (most cards)
      redirect: 'if_required',
    });

    setLoading(false);

    if (error) {
      const msg = error.message ?? t('Payment failed. Please try again.');
      setErrorMsg(msg);
      onError(msg);
    } else {
      onSuccess();
    }
  };

  return (
    <View style={{ gap: 16 }}>
      <PaymentElement
        options={{
          layout: 'tabs',
          fields: { billingDetails: { email: 'auto' } },
        }}
      />

      {errorMsg ? (
        <Text style={{ color: colors.error, fontSize: 13 }}>{errorMsg}</Text>
      ) : null}

      <Pressable
        onPress={handlePay}
        disabled={loading || !stripe}
        style={{
          backgroundColor: loading || !stripe ? colors.muted : colors.primary,
          borderRadius: 8,
          paddingVertical: 14,
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        {loading && <ActivityIndicator color="#fff" size="small" />}
        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>
          {loading ? t('Processing...') : t('Pay $3.99/month')}
        </Text>
      </Pressable>
    </View>
  );
}

type StripePaymentFormProps = {
  clientSecret: string;
  onSuccess: () => void;
  onError: (message: string) => void;
};

export default function StripePaymentForm({ clientSecret, onSuccess, onError }: StripePaymentFormProps) {
  const { colors } = useThemeTokens();

  if (Platform.OS !== 'web') return null;
  if (!stripePromise) {
    return (
      <Text style={{ color: colors.error, fontSize: 13, textAlign: 'center' }}>
        Stripe publishable key not configured.
      </Text>
    );
  }

  const appearance: Appearance = {
    theme: 'stripe',
    variables: {
      colorPrimary: colors.primary,
      colorBackground: colors.surface,
      colorText: colors.text,
      colorDanger: colors.error,
      borderRadius: '8px',
    },
  };

  return (
    <Elements stripe={stripePromise} options={{ clientSecret, appearance }}>
      <PayForm onSuccess={onSuccess} onError={onError} />
    </Elements>
  );
}
