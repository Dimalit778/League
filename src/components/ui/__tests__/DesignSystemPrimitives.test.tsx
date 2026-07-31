import { fireEvent, render } from '@testing-library/react-native';
import { Settings } from 'lucide-react-native';
import { Badge } from '../Badge';
import { Chip } from '../Chip';
import { EmptyState } from '../EmptyState';
import { IconButton } from '../IconButton';
import { ListItem } from '../ListItem';

describe('design system primitives', () => {
  it('provides accessible icon buttons', () => {
    const onPress = jest.fn();
    const { getByRole } = render(<IconButton icon={Settings} label="Settings" onPress={onPress} />);

    fireEvent.press(getByRole('button', { name: 'Settings' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('exposes badge meaning as text', () => {
    const { getByText } = render(<Badge label="LIVE" variant="live" />);
    expect(getByText('LIVE')).toBeTruthy();
  });

  it('reports selected chip state', () => {
    const { getByRole } = render(<Chip label="Today" variant="selected" onPress={jest.fn()} />);
    expect(getByRole('button', { name: 'Today' }).props.accessibilityState).toEqual({
      disabled: false,
      selected: true,
    });
  });

  it('renders an actionable empty state', () => {
    const onPress = jest.fn();
    const { getByRole, getByText } = render(
      <EmptyState title="No matches" actionLabel="Refresh" onActionPress={onPress} />,
    );

    expect(getByText('No matches')).toBeTruthy();
    fireEvent.press(getByRole('button', { name: 'Refresh' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders an accessible interactive list item', () => {
    const { getByRole } = render(<ListItem title="Preferences" right="chevron" onPress={jest.fn()} />);
    expect(getByRole('button', { name: 'Preferences' })).toBeTruthy();
  });
});
