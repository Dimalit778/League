import '@testing-library/react-native/build/matchers/extend-expect';
declare global {
  var testFormValues: Record<string, any>;
}

jest.mock('nativewind', () => ({
  vars: (v: any) => v,
  cssInterop: jest.fn(),
  remapProps: jest.fn(),
}));

jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { View } = require('react-native');
  const MockIcon = (props: any) => React.createElement(View, { ...props, testID: 'expo-vector-icon' });

  return {
    Feather: MockIcon,
    FontAwesome6: MockIcon,
    Ionicons: MockIcon,
  };
});

jest.mock('@expo/vector-icons/build/FontAwesome6', () => {
  const React = require('react');
  const { View } = require('react-native');
  return (props: any) => React.createElement(View, { ...props, testID: 'expo-vector-icon' });
});

jest.mock('@expo/vector-icons/Entypo', () => {
  const React = require('react');
  const { View } = require('react-native');
  return (props: any) => React.createElement(View, { ...props, testID: 'expo-vector-icon' });
});

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
    navigate: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  },
  useRouter: () => ({
    push: jest.fn(),
    navigate: jest.fn(),
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
    isDark: true,
    colors: {
      primary: '#000',
      primaryForeground: '#fff',
      primarySoft: '#222',
      secondary: '#111',
      background: '#222',
      backgroundSecondary: '#292929',
      surface: '#333',
      surfaceSoft: '#3a3a3a',
      surfaceSecondary: '#3a3a3a',
      surfaceElevated: '#444',
      border: '#444',
      borderStrong: '#555',
      text: '#fff',
      textSecondary: '#ddd',
      muted: '#888',
      mutedForeground: '#777',
      error: '#f00',
      errorSoft: '#400',
      success: '#0f0',
      successSoft: '#040',
      warning: '#f90',
      warningSoft: '#431',
      info: '#0af',
      infoSoft: '#034',
      overlay: 'rgba(0,0,0,0.5)',
    },
    fonts: {},
    gradients: {
      hero: ['#000', '#111', '#222'],
      premium: ['#111', '#222', '#333'],
    },
    spacing: { 0: 0, 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40, 12: 48 },
    radius: { sm: 8, md: 12, lg: 16, xl: 24, full: 999 },
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

const createMockMMKV = () => {
  const store = new Map<string, string>();
  return {
    set: jest.fn((key: string, value: string) => {
      store.set(key, value);
    }),
    getString: jest.fn((key: string) => store.get(key)),
    remove: jest.fn((key: string) => {
      store.delete(key);
    }),
    recrypt: jest.fn(),
    delete: jest.fn((key: string) => {
      store.delete(key);
    }),
    setString: jest.fn((key: string, value: string) => {
      store.set(key, value);
    }),
    contains: jest.fn((key: string) => store.has(key)),
    getAllKeys: jest.fn(() => [...store.keys()]),
    clearAll: jest.fn(() => {
      store.clear();
    }),
  };
};

jest.mock('react-native-mmkv', () => ({
  createMMKV: jest.fn(() => createMockMMKV()),
  MMKV: jest.fn().mockImplementation(() => createMockMMKV()),
}));

jest.mock('expo-secure-store', () => ({
  getItem: jest.fn(() => null),
  setItem: jest.fn(),
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  setItemAsync: jest.fn(() => Promise.resolve()),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock('expo-crypto', () => ({
  getRandomBytes: jest.fn((length: number) => Uint8Array.from({ length }, (_, i) => i + 1)),
}));

jest.mock('lucide-react-native', () => {
  const React = require('react');
  const { View } = require('react-native');
  const MockIcon = React.forwardRef((props: any, ref: any) =>
    React.createElement(View, { ...props, ref, testID: 'lucide-icon' })
  );
  MockIcon.displayName = 'MockLucideIcon';
  return new Proxy(
    { __esModule: true },
    {
      get: (_target, prop) => {
        if (prop === '__esModule') return true;
        return MockIcon;
      },
    }
  );
});

// Mock react-native-nitro-modules to prevent the NitroModules error
jest.mock('react-native-nitro-modules', () => ({
  NitroModules: {},
}));

jest.mock('react-native-purchases', () => ({
  __esModule: true,
  default: {
    invalidateCustomerInfoCache: jest.fn(() => Promise.resolve()),
    getCustomerInfo: jest.fn(() => Promise.resolve(null)),
    isConfigured: jest.fn(() => Promise.resolve(true)),
    configure: jest.fn(),
    getAppUserID: jest.fn(() => Promise.resolve('user-1')),
    logIn: jest.fn(() => Promise.resolve({ customerInfo: null })),
    logOut: jest.fn(() => Promise.resolve(null)),
    addCustomerInfoUpdateListener: jest.fn(),
    removeCustomerInfoUpdateListener: jest.fn(),
  },
}));

jest.mock('react-native-purchases-ui', () => ({
  __esModule: true,
  default: {
    presentPaywallIfNeeded: jest.fn(() => Promise.resolve('NOT_PRESENTED')),
  },
  PAYWALL_RESULT: {
    PURCHASED: 'PURCHASED',
    RESTORED: 'RESTORED',
    NOT_PRESENTED: 'NOT_PRESENTED',
    CANCELLED: 'CANCELLED',
    ERROR: 'ERROR',
  },
}));

jest.mock('@/lib/revenuecat/purchases', () => ({
  usePaywall: () => jest.fn(() => Promise.resolve(false)),
  useRevenueCatSubscription: () => ({
    customerInfo: null,
    subscription: {
      isActive: false,
      expiresAt: null,
      productId: null,
      willRenew: null,
      isAnonymous: true,
    },
    isSubscribed: false,
    isOffline: false,
    isSubscriptionKnown: true,
    isLoading: false,
    error: null,
    refreshCustomerInfo: jest.fn(() => Promise.resolve(null)),
  }),
  useSubscriptionLimits: () => ({
    maxLeagues: 2,
    maxMembersPerLeague: [6],
    competitions: ['ENGLISH', 'ITALIAN'],
    weeklyAiTips: 3,
  }),
}));

jest.mock('expo-image', () => {
  const { Image } = require('react-native');
  Object.defineProperty(Image, 'prefetch', {
    value: jest.fn(() => Promise.resolve(true)),
    configurable: true,
  });
  return {
    Image: Image,
    ImageBackground: Image,
  };
});

jest.mock('react-native-svg', () => {
  const React = require('react');
  const { View } = require('react-native');
  const SvgComponent = ({ children, ...props }: any) => React.createElement(View, props, children);

  return {
    __esModule: true,
    default: SvgComponent,
    Circle: SvgComponent,
    Defs: SvgComponent,
    LinearGradient: SvgComponent,
    Path: SvgComponent,
    Rect: SvgComponent,
    Stop: SvgComponent,
    SvgUri: () => null,
  };
});

jest.mock('@assets/icons', () => {
  const MockIcon = () => null;
  return new Proxy(
    {},
    {
      get: () => MockIcon,
    }
  );
});

jest.mock('@assets/app-icon-ios.png', () => 1);

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
  const React = require('react');
  const { View } = require('react-native');
  const AnimatedView = React.forwardRef((props: any, ref: any) => React.createElement(View, { ...props, ref }));
  AnimatedView.displayName = 'AnimatedView';

  return {
    __esModule: true,
    default: {
      View: AnimatedView,
      createAnimatedComponent: (Component: any) => Component,
    },
    cancelAnimation: jest.fn(),
    createAnimatedComponent: (Component: any) => Component,
    Easing: {
      ease: jest.fn(),
      cubic: jest.fn(),
      in: (value: any) => value,
      out: (value: any) => value,
      inOut: (value: any) => value,
    },
    interpolate: (_value: number, _input: number[], output: number[]) => output[0],
    interpolateColor: (_value: number, _input: number[], output: string[]) => output[0],
    useSharedValue: jest.fn((init: any) => ({ value: init })),
    useAnimatedProps: jest.fn((factory: () => object) => factory()),
    useAnimatedStyle: jest.fn(() => ({})),
    withSpring: jest.fn((val: any) => val),
    withTiming: jest.fn((val: any) => val),
    withRepeat: jest.fn((val: any) => val),
    withSequence: jest.fn((...values: any[]) => values.at(-1)),
  };
});

jest.mock('@/providers/AlertProvider', () => ({
  useAlert: () => ({
    showAlert: jest.fn(),
  }),
}));

jest.mock('@/features/auth/components/AppleAuth', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: () => React.createElement(View, null),
  };
});

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

jest.mock('expo-apple-authentication', () => ({
  isAvailableAsync: jest.fn(() => Promise.resolve(true)),
  signInAsync: jest.fn(() =>
    Promise.resolve({
      identityToken: 'mock-apple-id-token',
      authorizationCode: 'mock-auth-code',
      fullName: null,
      email: null,
      user: 'mock-apple-user',
      state: null,
      realUserStatus: 1,
    })
  ),
  AppleAuthenticationScope: {
    FULL_NAME: 0,
    EMAIL: 1,
  },
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
      signInWithIdToken: jest.fn(() =>
        Promise.resolve({
          data: { session: { user: { id: 'test-user-id' } } },
          error: null,
        })
      ),
      signInWithOAuth: jest.fn(() => Promise.resolve({ data: { url: null, provider: 'google' }, error: null })),
      signOut: jest.fn(),
      resetPasswordForEmail: jest.fn(),
      updateUser: jest.fn(),
      getUser: jest.fn(),
      getSession: jest.fn(() => Promise.resolve({ data: { session: null }, error: null })),
      startAutoRefresh: jest.fn(),
      stopAutoRefresh: jest.fn(),
      onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
    },
    rpc: jest.fn(() => Promise.resolve({ data: null, error: null })),
    functions: {
      invoke: jest.fn(() => Promise.resolve({ data: { success: true }, error: null })),
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

jest.mock('react-native-purchases', () => ({
  __esModule: true,
  default: {
    configure: jest.fn(),
    setLogLevel: jest.fn(),
    logIn: jest.fn(() => Promise.resolve({ customerInfo: { entitlements: { active: {} } } })),
    logOut: jest.fn(() => Promise.resolve({ customerInfo: { entitlements: { active: {} } } })),
    getOfferings: jest.fn(() =>
      Promise.resolve({
        current: {
          monthly: { identifier: '$rc_monthly' },
        },
      })
    ),
    purchasePackage: jest.fn(() =>
      Promise.resolve({
        customerInfo: { entitlements: { active: { pro: {} } } },
      })
    ),
    restorePurchases: jest.fn(() =>
      Promise.resolve({
        entitlements: { active: { pro: {} } },
      })
    ),
    getCustomerInfo: jest.fn(() =>
      Promise.resolve({
        entitlements: { active: {} },
      })
    ),
  },
  LOG_LEVEL: { DEBUG: 'DEBUG' },
}));

// Global form values storage for tests
globalThis.testFormValues = {};

jest.mock('react-hook-form', () => ({
  useForm: jest.fn(() => ({
    control: {
      _formValues: globalThis.testFormValues,
      _fields: {},
      _defaultValues: {},
    },
    handleSubmit: jest.fn((fn) => (event?: any) => {
      event?.preventDefault?.();
      // Call the function with the current form values
      const formData = globalThis.testFormValues || {};
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
      globalThis.testFormValues[name] = value;
    }),
    getValues: jest.fn(() => globalThis.testFormValues),
    reset: jest.fn(() => {
      globalThis.testFormValues = {};
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
        globalThis.testFormValues[name] = value;
      },
      onBlur: jest.fn(),
      value: globalThis.testFormValues[name] || '',
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
        globalThis.testFormValues[name] = value;
      },
      onBlur: jest.fn(),
      value: globalThis.testFormValues[name] || '',
      name,
      ref: jest.fn(),
    },
    fieldState: { error: null, invalid: false, isDirty: false },
    formState: { errors: {}, isValid: true },
  })),
  useFormContext: jest.fn(() => ({
    control: {
      _formValues: globalThis.testFormValues,
    },
    formState: { errors: {} },
  })),
}));
beforeEach(() => {
  // Clear form values between tests
  globalThis.testFormValues = {};
});

afterEach(() => {
  // Clear all mocks
  jest.clearAllMocks();
});
