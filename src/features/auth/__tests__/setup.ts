// Shared mocks for auth screen tests

type AuthResponse = Promise<{ success: boolean }>;

export const mockSignIn = jest.fn<AuthResponse, any[]>().mockResolvedValue({ success: true });
export const mockSignUp = jest.fn<AuthResponse, any[]>().mockResolvedValue({ success: true });
export const mockVerifyOtp = jest.fn<AuthResponse, any[]>().mockResolvedValue({ success: true });
export const mockResendOtp = jest.fn<AuthResponse, any[]>().mockResolvedValue({ success: true });
export const mockSendResetPasswordLink = jest.fn<AuthResponse, any[]>().mockResolvedValue({ success: true });
export const mockClearError = jest.fn();

export const mockAuthActions = {
  signIn: mockSignIn,
  signUp: mockSignUp,
  signInWithGoogle: jest.fn().mockResolvedValue({ success: true }),
  signOut: jest.fn().mockResolvedValue({ success: true }),
  verifyOtp: mockVerifyOtp,
  resendOtp: mockResendOtp,
  sendResetPasswordLink: mockSendResetPasswordLink,
  resendPasswordResetOtp: jest.fn().mockResolvedValue({ success: true }),
  isLoading: false,
  isError: false,
  errorMessage: null as string | null,
  clearError: mockClearError,
};

jest.mock('@/features/auth/hooks/useAuthActions', () => ({
  useAuthActions: () => ({
    ...mockAuthActions,
    errorMessage: mockAuthActions.errorMessage,
    isLoading: mockAuthActions.isLoading,
    isError: mockAuthActions.isError,
  }),
}));

jest.mock('@/features/auth/components/GoogleAuth', () => {
  const React = jest.requireActual('react');
  const { View } = jest.requireActual('react-native');
  return {
    __esModule: true,
    default: () =>
      React.createElement(View, {
        testID: 'google-sign-in-button',
        accessibilityRole: 'button',
        accessibilityLabel: 'Sign in with Google',
      }),
  };
});

jest.mock('@assets/icons', () => {
  const MockIcon = () => null;
  return {
    EmailIcon: MockIcon,
    MailIcon: MockIcon,
    LockIcon: MockIcon,
    UserIcon: MockIcon,
    EyeOpenIcon: MockIcon,
    EyeClosedIcon: MockIcon,
    ArrowLeftIcon: MockIcon,
    ArrowRightIcon: MockIcon,
  };
});

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
      updateUser: jest.fn().mockResolvedValue({ error: null }),
    },
  },
}));

export function resetAuthMocks() {
  mockSignIn.mockReset().mockResolvedValue({ success: true });
  mockSignUp.mockReset().mockResolvedValue({ success: true });
  mockVerifyOtp.mockReset().mockResolvedValue({ success: true });
  mockResendOtp.mockReset().mockResolvedValue({ success: true });
  mockSendResetPasswordLink.mockReset().mockResolvedValue({ success: true });
  mockClearError.mockReset();
  mockAuthActions.isLoading = false;
  mockAuthActions.isError = false;
  mockAuthActions.errorMessage = null;
}
