import '@testing-library/react-native/build/matchers/extend-expect';
declare global {
  var testFormValues: Record<string, any>;
}

jest.mock('nativewind', () => ({
  vars: (v: any) => v,
  cssInterop: jest.fn(),
  remapProps: jest.fn(),
}));

jest.mock('react-native-keyboard-controller', () => {
  const { ScrollView } = require('react-native');
  return {
    KeyboardAwareScrollView: ScrollView,
    KeyboardProvider: ({ children }: any) => children,
  };
});

jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  return {
    SafeAreaView: View,
    SafeAreaProvider: ({ children }: any) => children,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});

jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  },
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useLocalSearchParams: jest.fn(() => ({})),
  Link: ({ children, href, asChild }: any) => {
    const React = require('react');
    const { Pressable, View } = require('react-native');
    if (asChild) {
      return React.cloneElement(children, { accessibilityHint: href });
    }
    return React.createElement(View, { accessibilityHint: href }, children);
  },
}));

jest.mock('@/hooks/useThemeTokens', () => ({
  useThemeTokens: () => ({
    theme: 'dark',
    colors: {
      primary: '#000',
      secondary: '#111',
      background: '#222',
      surface: '#333',
      border: '#444',
      text: '#fff',
      muted: '#888',
      error: '#f00',
      success: '#0f0',
    },
    fonts: {},
  }),
}));

jest.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    language: 'en',
    setLanguage: jest.fn(),
    toggleLanguage: jest.fn(),
    isRTL: false,
    availableLanguages: ['en', 'he'],
  }),
}));

jest.mock('@/providers/LanguageProvider', () => ({
  useIsRTL: () => false,
  useLanguageContext: () => ({ language: 'en', version: 0, isRTL: false }),
  LanguageProvider: ({ children }: any) => children,
}));

jest.mock('@/store/LanguageStore', () => ({
  useLanguageStore: (selector: any) =>
    selector({
      language: 'en',
      setLanguage: jest.fn(),
      toggleLanguage: jest.fn(),
      initializeLanguage: jest.fn(),
    }),
}));

jest.mock('react-native-mmkv', () => ({
  createMMKV: jest.fn(() => ({
    getString: jest.fn(),
    setString: jest.fn(),
    delete: jest.fn(),
    contains: jest.fn(),
    getAllKeys: jest.fn(() => []),
    clearAll: jest.fn(),
  })),
  MMKV: jest.fn().mockImplementation(() => ({
    getString: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
    contains: jest.fn(),
    getAllKeys: jest.fn(() => []),
    clearAll: jest.fn(),
  })),
}));

// Mock react-native-nitro-modules to prevent the NitroModules error
jest.mock('react-native-nitro-modules', () => ({
  NitroModules: {},
}));

jest.mock('expo-image', () => {
  const { Image } = require('react-native');
  return {
    Image: Image,
  };
});

jest.mock('react-native-svg', () => ({
  SvgUri: () => null,
}));

jest.mock('@assets/icons', () => {
  const MockIcon = () => null;
  return new Proxy(
    {},
    {
      get: () => MockIcon,
    }
  );
});

jest.mock('@assets/app-icon.png', () => 1);

jest.mock('expo-clipboard', () => ({
  setStringAsync: jest.fn(),
  getStringAsync: jest.fn(() => Promise.resolve('')),
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
  NotificationFeedbackType: { Success: 'success', Warning: 'warning', Error: 'error' },
}));

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return {
    ...Reanimated,
    useSharedValue: jest.fn((init: any) => ({ value: init })),
    useAnimatedStyle: jest.fn(() => ({})),
    withSpring: jest.fn((val: any) => val),
    withTiming: jest.fn((val: any) => val),
  };
});

jest.mock('@/providers/AlertProvider', () => ({
  useAlert: () => ({
    show: jest.fn(),
    hide: jest.fn(),
  }),
}));

jest.mock('@/hooks/useConfirmDialog', () => ({
  useConfirmDialog: () => ({
    visible: false,
    show: jest.fn(),
    hide: jest.fn(),
    confirm: jest.fn(),
    cancel: jest.fn(),
  }),
}));

jest.mock('expo-auth-session', () => ({
  makeRedirectUri: jest.fn(() => 'league://redirect'),
}));

jest.mock('expo-web-browser', () => ({
  maybeCompleteAuthSession: jest.fn(),
  openAuthSessionAsync: jest.fn(),
}));

jest.mock('base64-arraybuffer', () => ({
  decode: jest.fn(() => new ArrayBuffer(0)),
}));

jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  requestMediaLibraryPermissionsAsync: jest.fn(() =>
    Promise.resolve({ granted: true })
  ),
  requestCameraPermissionsAsync: jest.fn(() =>
    Promise.resolve({ granted: true })
  ),
  MediaTypeOptions: { Images: 'Images' },
}));

jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    configure: jest.fn(),
    hasPlayServices: jest.fn(() => Promise.resolve(true)),
    signIn: jest.fn(() =>
      Promise.resolve({
        user: {
          id: 'test-id',
          name: 'Test User',
          email: 'test@example.com',
          photo: null,
        },
        idToken: 'mock-id-token',
        serverAuthCode: 'mock-server-auth-code',
      })
    ),
    signOut: jest.fn(() => Promise.resolve()),
    revokeAccess: jest.fn(() => Promise.resolve()),
    isSignedIn: jest.fn(() => Promise.resolve(false)),
    getCurrentUser: jest.fn(() => Promise.resolve(null)),
    getTokens: jest.fn(() =>
      Promise.resolve({
        idToken: 'mock-id-token',
        accessToken: 'mock-access-token',
      })
    ),
  },
  statusCodes: {
    SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED',
    IN_PROGRESS: 'IN_PROGRESS',
    PLAY_SERVICES_NOT_AVAILABLE: 'PLAY_SERVICES_NOT_AVAILABLE',
  },
  isErrorWithCode: jest.fn(() => false),
  isSuccessResponse: jest.fn(() => true),
}));

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      resetPasswordForEmail: jest.fn(),
      updateUser: jest.fn(),
      getUser: jest.fn(),
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      single: jest.fn(() => Promise.resolve({ data: null, error: null })),
    })),
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(),
        download: jest.fn(),
        remove: jest.fn(),
        getPublicUrl: jest.fn(() => ({ data: { publicUrl: 'mock-url' } })),
      })),
    },
  },
}));

jest.mock('@tanstack/react-query', () => ({
  useQueryClient: jest.fn(() => ({
    invalidateQueries: jest.fn(),
    setQueryData: jest.fn(),
    getQueryData: jest.fn(),
    removeQueries: jest.fn(),
  })),
  useQuery: jest.fn(() => ({
    data: null,
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  })),
  useMutation: jest.fn(() => ({
    mutate: jest.fn(),
    mutateAsync: jest.fn(),
    isLoading: false,
    error: null,
  })),
  QueryClient: jest.fn(),
  QueryClientProvider: ({ children }: any) => children,
}));

jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(() => jest.fn()),
  fetch: jest.fn(() => Promise.resolve({ isConnected: true, isInternetReachable: true })),
  useNetInfo: jest.fn(() => ({ isConnected: true, isInternetReachable: true })),
}));

// Global form values storage for tests
(global as any).testFormValues = {};

jest.mock('react-hook-form', () => ({
  useForm: jest.fn(() => ({
    control: {
      _formValues: (global as any).testFormValues,
      _fields: {},
      _defaultValues: {},
    },
    handleSubmit: jest.fn((fn) => (event?: any) => {
      event?.preventDefault?.();
      // Call the function with the current form values
      const formData = (global as any).testFormValues || {};
      return fn(formData);
    }),
    formState: {
      errors: {},
      isValid: true,
      isDirty: true,
      isSubmitting: false,
      isSubmitted: false,
    },
    watch: jest.fn(),
    setValue: jest.fn((name: string, value: any) => {
      (global as any).testFormValues[name] = value;
    }),
    getValues: jest.fn(() => (global as any).testFormValues),
    reset: jest.fn(() => {
      (global as any).testFormValues = {};
    }),
    trigger: jest.fn(() => Promise.resolve(true)),
    register: jest.fn((name: string) => ({
      onChange: jest.fn(),
      onBlur: jest.fn(),
      ref: jest.fn(),
      name,
    })),
  })),
  Controller: ({ render, name }: any) => {
    const field = {
      onChange: (value: any) => {
        (global as any).testFormValues[name] = value;
      },
      onBlur: jest.fn(),
      value: (global as any).testFormValues[name] || '',
      name,
      ref: jest.fn(),
    };
    return render({
      field,
      fieldState: { error: null, invalid: false, isDirty: false },
      formState: { errors: {}, isValid: true },
    });
  },
  useController: jest.fn(({ name }) => ({
    field: {
      onChange: (value: any) => {
        (global as any).testFormValues[name] = value;
      },
      onBlur: jest.fn(),
      value: (global as any).testFormValues[name] || '',
      name,
      ref: jest.fn(),
    },
    fieldState: { error: null, invalid: false, isDirty: false },
    formState: { errors: {}, isValid: true },
  })),
  useFormContext: jest.fn(() => ({
    control: {
      _formValues: (global as any).testFormValues,
    },
    formState: { errors: {} },
  })),
}));
beforeEach(() => {
  // Clear form values between tests
  (global as any).testFormValues = {};
});

afterEach(() => {
  // Clear all mocks
  jest.clearAllMocks();
});
