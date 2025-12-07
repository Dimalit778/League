# Language Store Usage Guide

Your app supports **English** (`en`) and **Hebrew** (`he`) languages. The `LanguageStore` manages the current language preference and persists it across app restarts.

## Quick Start

### 1. Using the `useTranslation` Hook (Recommended)

The easiest way to use translations in your components:

```tsx
import { useTranslation } from '@/hooks/useTranslation';

function MyComponent() {
  const { t, language, setLanguage, toggleLanguage } = useTranslation();

  return (
    <View>
      <Text>{t('Welcome to League')}</Text>
      <Text>Current language: {language}</Text>
      <Button
        title={t('Switch to {{language}}', { language: language === 'en' ? 'Hebrew' : 'English' })}
        onPress={toggleLanguage}
      />
    </View>
  );
}
```

**Available methods:**

- `t(key, variables?)` - Translate a string key (supports template variables like `{{variable}}`)
- `language` - Current language (`'en'` or `'he'`)
- `setLanguage(lang)` - Set language explicitly (`'en'` or `'he'`)
- `toggleLanguage()` - Switch between English and Hebrew
- `availableLanguages` - Array of supported languages

### 2. Using LanguageStore Directly

If you only need to read or change the language without translation:

```tsx
import { useLanguageStore } from '@/store/LanguageStore';

function LanguageSwitcher() {
  const language = useLanguageStore((state) => state.language);
  const setLanguage = useLanguageStore((state) => state.setLanguage);
  const toggleLanguage = useLanguageStore((state) => state.toggleLanguage);

  return <Button title={language === 'en' ? 'עברית' : 'English'} onPress={toggleLanguage} />;
}
```

### 3. Auto-Translation (Automatic)

Your app has **auto-translation** enabled via `src/lib/i18n/autoTranslate.ts`. This means:

- **Text components** are automatically translated
- **TextInput placeholders** are automatically translated
- **Alert dialogs** are automatically translated

You can write strings directly in English, and they'll be translated based on the current language:

```tsx
// This will automatically show in Hebrew if language is 'he'
<Text>Welcome to League</Text>
<TextInput placeholder="Enter your email" />
Alert.alert('Error', 'Failed to sign out');
```

### 4. Manual Translation

For cases where you need more control, use `translateRaw`:

```tsx
import { translateRaw } from '@/lib/i18n/translate';
import { useLanguageStore } from '@/store/LanguageStore';

function MyComponent() {
  const language = useLanguageStore((state) => state.language);
  const translated = translateRaw(language, 'Welcome to League');

  return <Text>{translated}</Text>;
}
```

### 5. Template Variables

You can use template variables in translations:

```tsx
const { t } = useTranslation();

// Translation key: "Language: {{language}}"
<Text>{t('Language: {{language}}', { language: 'English' })}</Text>;
```

### 6. Initializing Language

The language is automatically persisted and restored. To manually initialize:

```tsx
import { useLanguageStore } from '@/store/LanguageStore';

function App() {
  const initializeLanguage = useLanguageStore((state) => state.initializeLanguage);

  useEffect(() => {
    initializeLanguage();
  }, []);

  // ... rest of your app
}
```

## Examples

### Language Switcher Component

```tsx
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui';

export function LanguageSwitcher() {
  const { t, language, toggleLanguage } = useTranslation();

  return (
    <Button
      title={t('Switch to {{language}}', {
        language: language === 'en' ? 'Hebrew' : 'English',
      })}
      onPress={toggleLanguage}
    />
  );
}
```

### Settings Screen with Language Option

```tsx
import { useTranslation } from '@/hooks/useTranslation';
import { View, Text } from 'react-native';

export function SettingsScreen() {
  const { t, language, setLanguage, availableLanguages } = useTranslation();

  return (
    <View>
      <Text>{t('Language')}</Text>
      {availableLanguages.map((lang) => (
        <Button
          key={lang}
          title={lang === 'en' ? t('English') : t('Hebrew')}
          onPress={() => setLanguage(lang)}
          variant={language === lang ? 'primary' : 'secondary'}
        />
      ))}
    </View>
  );
}
```

### Conditional Content Based on Language

```tsx
import { useLanguageStore } from '@/store/LanguageStore';

function MyComponent() {
  const language = useLanguageStore((state) => state.language);
  const isRTL = language === 'he';

  return <View style={{ direction: isRTL ? 'rtl' : 'ltr' }}>{/* Your content */}</View>;
}
```

## Translation Files

Translations are stored in `src/lib/i18n/translations.ts`. To add new translations:

1. Add the English key-value pair in the `en` object
2. Add the Hebrew translation in the `he` object

Example:

```typescript
export const translations: Record<SupportedLanguage, TranslationDictionary> = {
  en: {
    'My New Text': 'My New Text',
    // ... other translations
  },
  he: {
    'My New Text': 'הטקסט החדש שלי',
    // ... other translations
  },
};
```

## Notes

- Language preference is **automatically persisted** using MMKV storage
- Default language is **English** (`'en'`)
- The store uses Zustand with persistence middleware
- Auto-translation works for React Native components automatically
- Hebrew translations are already included in your `translations.ts` file
