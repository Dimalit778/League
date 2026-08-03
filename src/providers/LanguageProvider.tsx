// LanguageProvider.tsx
import { useLanguageStore } from '@/store/LanguageStore';
import * as Updates from 'expo-updates';
import { createContext, useContext, useEffect, useState } from 'react';
import { DevSettings, I18nManager, Platform, View } from 'react-native';

const LanguageContext = createContext<{ language: string; version: number; isRTL: boolean }>({
  language: 'en',
  version: 0,
  isRTL: false,
});

function setWebDirection(rtl: boolean) {
  const doc = typeof document !== 'undefined' ? document : null;
  if (doc?.documentElement) {
    doc.documentElement.dir = rtl ? 'rtl' : 'ltr';
  }
}

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const language = useLanguageStore((state) => state.language);
  const [version, setVersion] = useState(0);
  const isRTL = language === 'he';

  useEffect(() => {
    const applyRTL = async () => {
      const shouldBeRTL = isRTL;

      if (Platform.OS === 'web') {
        setWebDirection(shouldBeRTL);
        setVersion((v) => v + 1);
        return;
      }

      if (I18nManager.isRTL !== shouldBeRTL) {
        I18nManager.allowRTL(shouldBeRTL);
        I18nManager.forceRTL(shouldBeRTL);

        try {
          if (!__DEV__) {
            await Updates.reloadAsync();
          } else {
            DevSettings.reload();
          }
        } catch {
          setVersion((v) => v + 1);
        }
      } else {
        setVersion((v) => v + 1);
      }
    };

    applyRTL();
  }, [language, isRTL]);

  return (
    <LanguageContext.Provider value={{ language, version, isRTL }}>
      <LanguageWrapper key={`lang-wrapper-${language}-${version}`} isRTL={isRTL}>
        {children}
      </LanguageWrapper>
    </LanguageContext.Provider>
  );
};

function LanguageWrapper({ children, isRTL }: { children: React.ReactNode; isRTL: boolean }) {
  return <View style={{ flex: 1, direction: isRTL ? 'rtl' : 'ltr' }}>{children}</View>;
}

export const useLanguageContext = () => {
  return useContext(LanguageContext);
};

export const useIsRTL = () => {
  const { isRTL } = useLanguageContext();
  return isRTL;
};
