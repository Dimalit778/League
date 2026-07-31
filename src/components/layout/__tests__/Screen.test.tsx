import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { Screen } from '../Screens';

describe('Screen', () => {
  it('renders children', () => {
    const { getByText } = render(
      <Screen>
        <Text>Screen content</Text>
      </Screen>,
    );
    expect(getByText('Screen content')).toBeTruthy();
  });

  it('renders with custom className', () => {
    const { getByText } = render(
      <Screen className="p-4">
        <Text>Styled screen</Text>
      </Screen>,
    );
    expect(getByText('Styled screen')).toBeTruthy();
  });

  it('renders with safe area wrapper', () => {
    const { getByText } = render(
      <Screen edges={['top']}>
        <Text>Safe content</Text>
      </Screen>,
    );
    expect(getByText('Safe content')).toBeTruthy();
  });

  it('renders without safe area by default', () => {
    const { getByText } = render(
      <Screen>
        <Text>No safe area</Text>
      </Screen>,
    );
    expect(getByText('No safe area')).toBeTruthy();
  });

  it('supports scrollable content', () => {
    const { getByText } = render(
      <Screen scroll padding="horizontal" bottomInset={80}>
        <Text>Scrollable content</Text>
      </Screen>,
    );

    expect(getByText('Scrollable content')).toBeTruthy();
  });

  it('supports compact responsive content', () => {
    const { getByText } = render(
      <Screen width="compact" padding="horizontal">
        <Text>Compact content</Text>
      </Screen>,
    );

    expect(getByText('Compact content')).toBeTruthy();
  });
});
