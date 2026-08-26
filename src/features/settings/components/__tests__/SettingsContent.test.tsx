/* eslint-disable @typescript-eslint/no-require-imports */
import { fireEvent, render } from '@testing-library/react-native';
import SettingsContent from '../Settings/SettingsContent';

jest.mock('@/store/AuthStore', () => ({
  useAuthStore: (selector: (state: { user: object }) => unknown) =>
    selector({
      user: { id: 'u1', email: 'test@test.com', full_name: 'Test User', created_at: '2024-01-01' },
    }),
}));

jest.mock('@/providers/NotificationProvider', () => ({
  useNotificationPermission: () => ({
    permission: { status: 'granted', canAskAgain: true },
    isRequesting: false,
    requestPermission: jest.fn(),
  }),
}));

jest.mock('../LanguageToggle', () => {
  const { Text } = require('react-native');
  return { __esModule: true, default: () => <Text>LanguageToggle</Text> };
});

jest.mock('../ThemeToggle', () => {
  const { Text } = require('react-native');
  return { __esModule: true, default: () => <Text>ThemeToggle</Text> };
});

describe('SettingsContent', () => {
  it('calls account actions from the Account section', () => {
    const onSignOut = jest.fn();
    const onDeleteAccount = jest.fn();
    const { getByText } = render(<SettingsContent onSignOut={onSignOut} onDeleteAccount={onDeleteAccount} />);

    fireEvent.press(getByText('Sign Out'));
    fireEvent.press(getByText('Delete Account'));

    expect(onSignOut).toHaveBeenCalledTimes(1);
    expect(onDeleteAccount).toHaveBeenCalledTimes(1);
    expect(getByText('Delete Account').props.className).toContain('text-error');
    expect(getByText('Version')).toBeTruthy();
    expect(getByText('1.0.0')).toBeTruthy();
    expect(getByText('Accessibility Statement')).toBeTruthy();
  });
});
