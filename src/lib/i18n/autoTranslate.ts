import { translateRaw } from '@/lib/i18n/translate';
import { SupportedLanguage, useLanguageStore } from '@/store/LanguageStore';
import React from 'react';
import { Alert, Text, TextInput } from 'react-native';
let currentLanguage: SupportedLanguage = useLanguageStore.getState().language;
useLanguageStore.subscribe((state) => {
  currentLanguage = state.language;
});
const translateValue = (value: unknown): unknown => {
  if (typeof value === 'string') {
    return translateRaw(currentLanguage, value);
  }
  if (Array.isArray(value)) {
    return value.map((item) => translateValue(item));
  }
  return value;
};
const translateChildren = (children: unknown[]): unknown[] => children.map((child) => translateValue(child));
const translateProps = (props?: Record<string, unknown>) => {
  if (!props) {
    return props;
  }
  let didChange = false;
  const nextProps: Record<string, unknown> = { ...props };
  const maybeTranslateProp = (key: string) => {
    const value = props[key];
    if (typeof value === 'string') {
      nextProps[key] = translateRaw(currentLanguage, value);
      didChange = true;
    }
  };
  maybeTranslateProp('placeholder');
  maybeTranslateProp('accessibilityLabel');
  maybeTranslateProp('accessibilityHint');
  maybeTranslateProp('title');
  return didChange ? nextProps : props;
};
const originalCreateElement = React.createElement;
// @ts-expect-error: augmenting createElement for runtime translation
React.createElement = function createElementWithTranslation(type: any, props: any, ...children: any[]) {
  if (type === Text) {
    const translatedChildren = translateChildren(children);
    return originalCreateElement.call(React, type, props, ...(translatedChildren as React.ReactNode[]));
  }
  if (type === TextInput) {
    const translatedProps = translateProps(props);
    return originalCreateElement.call(React, type, translatedProps, ...(children as React.ReactNode[]));
  }
  const translatedProps = translateProps(props);
  return originalCreateElement.call(
    React,
    type,
    translatedProps,
    ...(children.map((child) => translateValue(child)) as React.ReactNode[])
  );
};
const originalAlert = Alert.alert;
Alert.alert = function translatedAlert(
  title: string,
  message?: string,
  buttons?: Parameters<typeof Alert.alert>[2],
  options?: Parameters<typeof Alert.alert>[3]
) {
  const translatedTitle = translateRaw(currentLanguage, title);
  const translatedMessage = message !== undefined ? translateRaw(currentLanguage, message) : message;
  const translatedButtons = buttons?.map((button) => {
    if (!button?.text) {
      return button;
    }
    return {
      ...button,
      text: translateRaw(currentLanguage, button.text),
    };
  });
  return originalAlert(translatedTitle, translatedMessage, translatedButtons, options);
};
