import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { Screen } from '../Screen';

describe('Screen', () => {
  it('renders children', () => {
    const { getByText } = render(
      <Screen>
        <Text>Screen content</Text>
      </Screen>
    );
    expect(getByText('Screen content')).toBeTruthy();
  });

  it('renders with custom className', () => {
    const { getByText } = render(
      <Screen className="p-4">
        <Text>Styled screen</Text>
      </Screen>
    );
    expect(getByText('Styled screen')).toBeTruthy();
  });

  it('renders with safe area wrapper', () => {
    const { getByText } = render(
      <Screen withSafeArea>
        <Text>Safe content</Text>
      </Screen>
    );
    expect(getByText('Safe content')).toBeTruthy();
  });

  it('renders without safe area by default', () => {
    const { getByText } = render(
      <Screen>
        <Text>No safe area</Text>
      </Screen>
    );
    expect(getByText('No safe area')).toBeTruthy();
  });
});
