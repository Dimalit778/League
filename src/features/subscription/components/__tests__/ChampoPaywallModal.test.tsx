import { render, waitFor } from '@testing-library/react-native';
import Purchases from 'react-native-purchases';

import PaywallModal from '../../screens/ChamoPaywallModal';

const mockedPurchases = Purchases as jest.Mocked<typeof Purchases>;

describe('PaywallModal', () => {
  beforeEach(() => {
    mockedPurchases.getOfferings.mockResolvedValue({
      all: {},
      current: {
        availablePackages: [
          {
            identifier: 'season-pass',
            product: {
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
    expect(getByTestId('comparison-background').props.contentFit).toBe('cover');
    expect(getByTestId('comparison-background').props.accessible).toBe(false);
    expect(getByTestId('paywall-price').props.children).toBe('$29.99');
    expect(getByText('Get full access')).toBeTruthy();
    expect(getByText('Football competitions')).toBeTruthy();
    expect(getByText('Members per league')).toBeTruthy();
    expect(getByText('AI match insights')).toBeTruthy();
    expect(mockedPurchases.getOfferings).toHaveBeenCalled();
  });
});
