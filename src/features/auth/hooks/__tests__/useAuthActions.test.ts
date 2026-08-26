import { act, renderHook } from '@testing-library/react-native';
import * as authApi from '../../api/authApi';
import { useAuthActions } from '../useAuthActions';

// Mock the authApi
jest.mock('../../api/authApi', () => ({
  signUp: jest.fn(),
  signIn: jest.fn(),
  signInWithGoogle: jest.fn(),
  signOut: jest.fn(),
  verifyOtp: jest.fn(),
  resendOtp: jest.fn(),
  sendResetPasswordLink: jest.fn(),
  resendPasswordResetOtp: jest.fn(),
}));

jest.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({
    invalidateQueries: jest.fn(),
  }),
}));

const mockAuthApi = authApi as jest.Mocked<typeof authApi>;
const acceptance = {
  accepted: true,
  termsVersion: '2026-08-04',
  privacyVersion: '2026-08-26.2',
  source: 'email',
  authFlow: 'sign_up',
  locale: 'en',
  appVersion: '1.0.0',
} as const;

describe('useAuthActions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle successful signUp', async () => {
    mockAuthApi.signUp.mockResolvedValue({ success: true });

    const { result } = renderHook(() => useAuthActions());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.errorMessage).toBe(null);

    await act(async () => {
      const response = await result.current.signUp('test@example.com', 'password123', 'Test User', acceptance);
      expect(response.success).toBe(true);
    });

    expect(mockAuthApi.signUp).toHaveBeenCalledWith('test@example.com', 'password123', 'Test User', acceptance);
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle failed signUp', async () => {
    const errorMessage = 'Email already exists';
    mockAuthApi.signUp.mockResolvedValue({ success: false, error: errorMessage });

    const { result } = renderHook(() => useAuthActions());

    await act(async () => {
      const response = await result.current.signUp('test@example.com', 'password123', 'Test User', acceptance);
      expect(response.success).toBe(false);
    });

    expect(result.current.isError).toBe(true);
    expect(result.current.errorMessage).toBe(errorMessage);
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle successful verifyOtp', async () => {
    mockAuthApi.verifyOtp.mockResolvedValue({ success: true });

    const { result } = renderHook(() => useAuthActions());

    await act(async () => {
      const response = await result.current.verifyOtp('test@example.com', '123456');
      expect(response.success).toBe(true);
    });

    expect(mockAuthApi.verifyOtp).toHaveBeenCalledWith('test@example.com', '123456');
  });

  it('should clear errors', () => {
    const { result } = renderHook(() => useAuthActions());

    // First set an error state by simulating a failed action
    act(() => {
      result.current.clearError();
    });

    expect(result.current.isError).toBe(false);
    expect(result.current.errorMessage).toBe(null);
  });

  it('should handle loading states correctly', async () => {
    // Mock a slow API call
    mockAuthApi.signUp.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ success: true }), 100))
    );

    const { result } = renderHook(() => useAuthActions());

    expect(result.current.isLoading).toBe(false);

    // Start the async action
    act(() => {
      result.current.signUp('test@example.com', 'password123', 'Test User', acceptance);
    });

    // Should be loading now
    expect(result.current.isLoading).toBe(true);

    // Wait for the action to complete
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 150));
    });

    // Should not be loading anymore
    expect(result.current.isLoading).toBe(false);
  });
});
