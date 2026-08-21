import { render } from '@testing-library/react-native';
import { Text } from '../Text';

describe('Text', () => {
  it('renders text content', () => {
    const { getByText } = render(<Text>Hello World</Text>);
    expect(getByText('Hello World')).toBeTruthy();
  });

  it('renders with size className', () => {
    const { getByText } = render(<Text className="text-3xl">Heading</Text>);
    expect(getByText('Heading')).toBeTruthy();
  });

  it('renders with display variant (oswald)', () => {
    const { getByText } = render(<Text variant="display">Score</Text>);
    expect(getByText('Score')).toBeTruthy();
  });

  it('renders with custom className', () => {
    const { getByText } = render(<Text className="text-red-500">Styled</Text>);
    expect(getByText('Styled')).toBeTruthy();
  });

  it('passes extra TextProps through', () => {
    const { getByText } = render(<Text numberOfLines={1}>Truncated</Text>);
    expect(getByText('Truncated')).toBeTruthy();
  });

  it('supports semantic variants and tones', () => {
    const { getByText } = render(
      <Text variant="header" tone="primary">
        3–1
      </Text>,
    );

    expect(getByText('3–1')).toBeTruthy();
  });

  it('supports Dynamic Type with a safe default ceiling', () => {
    const { getByText } = render(<Text>Scalable</Text>);

    expect(getByText('Scalable').props.allowFontScaling).toBe(true);
    expect(getByText('Scalable').props.maxFontSizeMultiplier).toBe(2);
  });
});
