import { render } from '@testing-library/react-native';
import SettingsScreen from '../../screens/SettingsScreen';

jest.mock('@/store/AuthStore', () => ({
  useAuthStore: (selector: any) =>
    selector({
      user: { id: 'u1', email: 'test@test.com', full_name: 'Test User', role: 'USER', created_at: '2024-01-01' },
    }),
}));

jest.mock('@/features/auth/hooks/useAuthActions', () => ({
  useAuthActions: () => ({
    signOut: jest.fn(),
    isLoading: false,
  }),
}));

jest.mock('@/features/subscription/hooks/useSubscription', () => ({
  useSubscription: () => ({
    data: { subscription_type: 'FREE' },
    isLoading: false,
  }),
}));

jest.mock('@/features/settings/components/Settings/SettingsContent', () => {
  const { Text } = require('react-native');
  return {
    __esModule: true,
    default: () => <Text>SettingsContent</Text>,
  };
});

describe('SettingsScreen', () => {
  it('renders Sign Out button', () => {
    const { getAllByText } = render(<SettingsScreen />);
    expect(getAllByText('Sign Out').length).toBeGreaterThan(0);
  });

  it('renders settings content', () => {
    const { getByText } = render(<SettingsScreen />);
    expect(getByText('SettingsContent')).toBeTruthy();
  });
});
