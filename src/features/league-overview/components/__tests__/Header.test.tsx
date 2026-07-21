import { render } from '@testing-library/react-native';
import Header from '@/features/league-overview/components/Header';

const props = {
  nickname: 'Tester',
  avatarUrl: null,
  leagueName: 'My League',
  logoUrl: '',
  flagUrl: '',
  rank: 3,
  points: 42,
  membersCount: 8,
};

describe('Header (league overview)', () => {
  it('renders league name, rank, points and members count from props', () => {
    const { queryByText, queryAllByText } = render(<Header {...props} />);
    expect(queryAllByText('My League').length).toBeGreaterThan(0); // shown twice (title + subtitle)
    expect(queryByText('#3')).toBeTruthy();
    expect(queryByText('42')).toBeTruthy();
    expect(queryByText('8')).toBeTruthy();
  });
});
