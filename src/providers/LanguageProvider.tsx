// LanguageProvider.tsx
import { useLanguageStore } from '@/store/LanguageStore';
import * as Updates from 'expo-updates';
import { createContext, useContext, useEffect, useState } from 'react';
import { DevSettings, I18nManager } from 'react-native';

const LanguageContext = createContext<{ language: string; version: number; isRTL: boolean }>({
  language: 'en',
  version: 0,
  isRTL: false,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const language = useLanguageStore((state) => state.language);
  const [version, setVersion] = useState(0);
  const isRTL = language === 'he';

  useEffect(() => {
    const applyRTL = async () => {
      const shouldBeRTL = isRTL;

      if (I18nManager.isRTL !== shouldBeRTL) {
        I18nManager.allowRTL(shouldBeRTL);
        I18nManager.forceRTL(shouldBeRTL);

        try {
          if (!__DEV__) {
            await Updates.reloadAsync();
          } else {
            DevSettings.reload();
          }
        } catch (e) {
          console.warn('Failed to reload app after RTL change', e);
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
}

function LanguageWrapper({ children }: { children: React.ReactNode; isRTL: boolean }) {
  return <>{children}</>;
}

export function useLanguageContext() {
  return useContext(LanguageContext);
}

export function useIsRTL() {
  const { isRTL } = useLanguageContext();
  return isRTL;
}
