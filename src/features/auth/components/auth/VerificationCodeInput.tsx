import { Row } from '@/components';
import { useTranslation } from '@/hooks/useTranslation';
import { useRef, useState } from 'react';
import { TextInput, useWindowDimensions } from 'react-native';

const CODE_LENGTH = 6;

type VerificationCodeInputProps = {
  value: string[];
  onChange: (value: string[]) => void;
  hasError?: boolean;
};

export default function VerificationCodeInput({ value, onChange, hasError = false }: VerificationCodeInputProps) {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const digits = Array.from({ length: CODE_LENGTH }, (_, index) => value[index] ?? '');
  const availableWidth = Math.min(width - 80, 440);
  const cellSize = Math.min(58, Math.max(40, (availableWidth - 40) / CODE_LENGTH));

  const replaceCode = (text: string, index: number) => {
    const clean = text.replace(/[^0-9]/g, '').slice(0, CODE_LENGTH);
    if (clean.length > 1) {
      const pasted = Array(CODE_LENGTH).fill('');
      clean.split('').forEach((digit, pastedIndex) => {
        pasted[pastedIndex] = digit;
      });
      onChange(pasted);
      inputRefs.current[Math.min(clean.length, CODE_LENGTH) - 1]?.focus();
      return;
    }

    const next = [...digits];
    next[index] = clean;
    onChange(next);
    if (clean && index < CODE_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  };

  return (
    <Row keepLtr className="w-full justify-center gap-2">
      {digits.map((digit, index) => {
        const isFocused = focusedIndex === index;
        return (
          <TextInput
            key={index}
            ref={(ref) => {
              inputRefs.current[index] = ref;
            }}
            value={digit}
            onChangeText={(text) => replaceCode(text, index)}
            onKeyPress={(event) => {
              if (event.nativeEvent.key === 'Backspace' && !digit && index > 0) {
                inputRefs.current[index - 1]?.focus();
              }
            }}
            onFocus={() => setFocusedIndex(index)}
            onBlur={() => setFocusedIndex(-1)}
            keyboardType="number-pad"
            textContentType={index === 0 ? 'oneTimeCode' : 'none'}
            autoComplete={index === 0 ? 'one-time-code' : 'off'}
            maxLength={index === 0 ? CODE_LENGTH : 1}
            selectTextOnFocus
            className="rounded-2xl bg-[#0A1B30] text-center font-oswald-bold text-[32px] text-white"
            style={{
              width: cellSize,
              height: Math.max(58, cellSize * 1.12),
              borderWidth: isFocused ? 2 : 1,
              borderColor: hasError ? '#F87171' : isFocused ? '#FFB31A' : digit ? '#5275A2' : '#29476E',
              writingDirection: 'ltr',
            }}
            accessibilityLabel={t('Verification code digit {{number}}', { number: index + 1 })}
            accessibilityHint={t('Enter a single digit')}
          />
        );
      })}
    </Row>
  );
}
