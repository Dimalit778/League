import { fireEvent, render } from '@testing-library/react-native';
import MyLeagueCard from '../MyLeagueCard';

const mockItem = {
  league_id: 'l1',
  league: {
    id: 'l1',
    name: 'My Test League',
    competition: {
      logo: 'https://example.com/logo.png',
    },
  },
  nickname: 'TestPlayer',
  is_primary: false,
};

describe('MyLeagueCard', () => {
  it('renders league name', () => {
    const { getByText } = render(
      <MyLeagueCard item={mockItem} handleSetPrimary={jest.fn()} />
    );
    expect(getByText('My Test League')).toBeTruthy();
  });

  it('renders nickname', () => {
    const { getByText } = render(
      <MyLeagueCard item={mockItem} handleSetPrimary={jest.fn()} />
    );
    expect(getByText('TestPlayer')).toBeTruthy();
  });

  it('calls handleSetPrimary when pressed', () => {
    const handleSetPrimary = jest.fn();
    const { getByText } = render(
      <MyLeagueCard item={mockItem} handleSetPrimary={handleSetPrimary} />
    );
    fireEvent.press(getByText('My Test League'));
    expect(handleSetPrimary).toHaveBeenCalledWith('l1', false);
  });
});
