import { render } from '@testing-library/react-native';
import AdminDashboardScreen from '../../screens/AdminDashboardScreen';

jest.mock('@/features/auth/hooks/useAuthActions', () => ({
  useAuthActions: () => ({
    signOut: jest.fn(),
    isLoading: false,
  }),
}));

jest.mock('@/features/admin/hooks/useAdmin', () => ({
  useAdminDashboard: () => ({
    data: {
      users: 100,
      leagues: 25,
      leagueMembers: 200,
      predictions: 5000,
      subscriptions: 10,
      pendingReports: 3,
    },
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  }),
}));

jest.mock('@expo/vector-icons', () => ({
  Entypo: () => null,
}));

jest.mock('@react-navigation/native', () => ({
  useIsFocused: () => true,
}));

describe('AdminDashboardScreen', () => {
  it('renders Platform Overview heading', () => {
    const { getByText } = render(<AdminDashboardScreen />);
    expect(getByText('Platform Overview')).toBeTruthy();
  });

  it('renders dashboard stats', () => {
    const { getByText } = render(<AdminDashboardScreen />);
    expect(getByText('100')).toBeTruthy();
    expect(getByText('25')).toBeTruthy();
    expect(getByText('200')).toBeTruthy();
  });

  it('renders navigation links', () => {
    const { getByText } = render(<AdminDashboardScreen />);
    expect(getByText('User Management')).toBeTruthy();
    expect(getByText('League Management')).toBeTruthy();
    expect(getByText('Competitions')).toBeTruthy();
    expect(getByText('Content Reports')).toBeTruthy();
  });

  it('renders Logout button', () => {
    const { getByText } = render(<AdminDashboardScreen />);
    expect(getByText('Logout')).toBeTruthy();
  });
});
