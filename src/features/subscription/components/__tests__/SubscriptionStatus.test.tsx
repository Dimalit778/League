import { render } from '@testing-library/react-native';
import SubscriptionStatus from '../subscription/SubscriptionStatus';

describe('SubscriptionStatus', () => {
  it('renders Free Plan for null subscription', () => {
    const { getByText } = render(<SubscriptionStatus subscriptionType={null} />);
    expect(getByText('Free Plan')).toBeTruthy();
  });

  it('renders Free Plan for FREE type', () => {
    const { getByText } = render(<SubscriptionStatus subscriptionType={'FREE' as any} />);
    expect(getByText('Free Plan')).toBeTruthy();
  });

  it('renders PREMIUM Plan label', () => {
    const { getByText } = render(<SubscriptionStatus subscriptionType={'PREMIUM' as any} />);
    expect(getByText('PREMIUM Plan')).toBeTruthy();
  });

  it('renders BASIC Plan label', () => {
    const { getByText } = render(<SubscriptionStatus subscriptionType={'BASIC' as any} />);
    expect(getByText('BASIC Plan')).toBeTruthy();
  });

  it('renders Upgrade button for free plans', () => {
    const { getByText } = render(<SubscriptionStatus subscriptionType={null} />);
    expect(getByText('Upgrade')).toBeTruthy();
  });
});
