import { fireEvent, render } from '@testing-library/react-native';
import SubscriptionCard from '../subscription/SubscriptionCard';

describe('SubscriptionCard', () => {
  const defaultProps = {
    type: 'FREE' as const,
    price: 'Free',
    features: ['Join up to 2 leagues', 'Basic stats'],
    onSelect: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders plan type and price', () => {
    const { getByText } = render(<SubscriptionCard {...defaultProps} />);
    expect(getByText('FREE')).toBeTruthy();
    expect(getByText(/Free/)).toBeTruthy();
  });

  it('renders features list', () => {
    const { getByText } = render(<SubscriptionCard {...defaultProps} />);
    expect(getByText('Join up to 2 leagues')).toBeTruthy();
    expect(getByText('Basic stats')).toBeTruthy();
  });

  it('renders Select Plan button when not active', () => {
    const { getByText } = render(<SubscriptionCard {...defaultProps} />);
    expect(getByText('Select Plan')).toBeTruthy();
  });

  it('renders Current Plan when active', () => {
    const { getByText } = render(<SubscriptionCard {...defaultProps} isActive />);
    expect(getByText('Current Plan')).toBeTruthy();
  });

  it('calls onSelect when pressed', () => {
    const onSelect = jest.fn();
    const { getByText } = render(<SubscriptionCard {...defaultProps} onSelect={onSelect} />);
    fireEvent.press(getByText('Select Plan'));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('renders PREMIUM plan', () => {
    const { getByText } = render(
      <SubscriptionCard
        type={'PREMIUM' as any}
        price="$9.99"
        features={['All features']}
        onSelect={jest.fn()}
      />
    );
    expect(getByText('PREMIUM')).toBeTruthy();
    expect(getByText(/\$9\.99/)).toBeTruthy();
  });
});
