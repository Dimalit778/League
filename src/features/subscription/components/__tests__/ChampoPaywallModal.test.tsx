import { render, waitFor } from '@testing-library/react-native';
import Purchases from 'react-native-purchases';

import { useCurrentSeason } from '@/features/subscription/hooks/useCurrentSeason';

import PaywallModal from '../../screens/ChamoPaywallModal';

const mockedPurchases = Purchases as jest.Mocked<typeof Purchases>;

jest.mock('@/features/subscription/hooks/useCurrentSeason', () => ({
  useCurrentSeason: jest.fn(),
}));

jest.mock('@/lib/revenuecat/purchases', () => ({
  useRestorePurchases: () => jest.fn().mockResolvedValue(false),
}));

const mockedUseCurrentSeason = useCurrentSeason as jest.Mock;

// A window that always contains "now", regardless of wall-clock time, so the
// current purchase-flow tests stay deterministic.
const ALWAYS_ACTIVE_SEASON = {
  code: '2026-27',
  startsAt: '2000-01-01T00:00:00Z',
  endsAt: '2100-01-01T00:00:00Z',
};

describe('PaywallModal', () => {
  beforeEach(() => {
    mockedUseCurrentSeason.mockReturnValue({ season: ALWAYS_ACTIVE_SEASON, isLoading: false });

    mockedPurchases.getOfferings.mockResolvedValue({
      all: {},
      current: {
        availablePackages: [
          {
            identifier: 'champo_pro_season',
            product: {
              identifier: 'champo_pro_season',
              priceString: '$29.99',
              productType: 'UNKNOWN',
            },
          },
        ],
      },
    } as never);
  });

  it('renders a routed paywall screen with a visible price and detailed Free/Pro benefits', async () => {
    const { getByRole, getByTestId, getByText, queryByTestId, queryByText } = render(
      <PaywallModal onComplete={jest.fn()} />,
    );

    await waitFor(() => expect(queryByText('Confirming the local App Store price…')).toBeNull());
    expect(queryByTestId('paywall-error')?.props.children).toBeUndefined();
    expect(getByRole('button', { name: 'Upgrade for $29.99' }).props.accessibilityState.disabled).toBe(false);

    expect(getByTestId('paywall-screen')).toBeTruthy();
    expect(getByTestId('comparison-background').props.contentFit).toBe('contain');
    expect(getByTestId('comparison-background').props.accessible).toBe(false);
    expect(getByTestId('paywall-price').props.children).toBe('$29.99');
    expect(getByText('Get full access')).toBeTruthy();
    expect(getByText('Football competitions')).toBeTruthy();
    expect(getByText('Members per league')).toBeTruthy();
    expect(getByText('AI match insights')).toBeTruthy();
    expect(getByRole('link', { name: 'Terms of Service' })).toBeTruthy();
    expect(getByRole('link', { name: 'Privacy Policy' })).toBeTruthy();
    expect(mockedPurchases.getOfferings).toHaveBeenCalled();
  });

  it('shows the no-active-season state and hides the purchase button when there is no current season', async () => {
    mockedUseCurrentSeason.mockReturnValue({ season: null, isLoading: false });

    const { getByText, queryByRole } = render(<PaywallModal onComplete={jest.fn()} />);

    await waitFor(() => expect(getByText('No active season right now')).toBeTruthy());
    expect(queryByRole('button', { name: /Upgrade for/ })).toBeNull();
  });
});
