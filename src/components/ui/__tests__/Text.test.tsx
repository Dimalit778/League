import { render } from '@testing-library/react-native';
import { Text } from '../Text';

jest.mock('@/lib/nativeWind', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

describe('Text', () => {
  it('renders text content', () => {
    const { getByText } = render(<Text>Hello World</Text>);
    expect(getByText('Hello World')).toBeTruthy();
  });

  it('renders with default body variant', () => {
    const { getByText } = render(<Text>Body text</Text>);
    expect(getByText('Body text')).toBeTruthy();
  });

  it('renders with h1 variant', () => {
    const { getByText } = render(<Text variant="h1">Heading</Text>);
    expect(getByText('Heading')).toBeTruthy();
  });

  it('renders with h2 variant', () => {
    const { getByText } = render(<Text variant="h2">Subheading</Text>);
    expect(getByText('Subheading')).toBeTruthy();
  });

  it('renders with caption variant', () => {
    const { getByText } = render(<Text variant="caption">Caption</Text>);
    expect(getByText('Caption')).toBeTruthy();
  });

  it('renders with small variant', () => {
    const { getByText } = render(<Text variant="small">Small text</Text>);
    expect(getByText('Small text')).toBeTruthy();
  });

  it('renders with bold prop', () => {
    const { getByText } = render(<Text bold>Bold text</Text>);
    expect(getByText('Bold text')).toBeTruthy();
  });

  it('renders with custom className', () => {
    const { getByText } = render(<Text className="text-red-500">Styled</Text>);
    expect(getByText('Styled')).toBeTruthy();
  });

  it('passes extra TextProps through', () => {
    const { getByText } = render(<Text numberOfLines={1}>Truncated</Text>);
    expect(getByText('Truncated')).toBeTruthy();
  });
});
