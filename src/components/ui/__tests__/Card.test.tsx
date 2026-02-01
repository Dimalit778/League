import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { Card } from '../Card';

describe('Card', () => {
  it('renders children', () => {
    const { getByText } = render(
      <Card>
        <Text>Card content</Text>
      </Card>
    );
    expect(getByText('Card content')).toBeTruthy();
  });

  it('renders with custom className', () => {
    const { getByText } = render(
      <Card className="p-4">
        <Text>Styled card</Text>
      </Card>
    );
    expect(getByText('Styled card')).toBeTruthy();
  });

  it('renders without className', () => {
    const { getByText } = render(
      <Card>
        <Text>No class</Text>
      </Card>
    );
    expect(getByText('No class')).toBeTruthy();
  });
});
