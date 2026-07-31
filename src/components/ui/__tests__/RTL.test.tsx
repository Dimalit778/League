import { render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { Text } from '../Text';

jest.mock('@/providers/LanguageProvider', () => ({
  useIsRTL: () => true,
}));

describe('RTL primitives', () => {
  it('applies RTL writing direction and alignment to semantic text', () => {
    const { getByText } = render(<Text>טקסט בעברית</Text>);
    const style = StyleSheet.flatten(getByText('טקסט בעברית').props.style);

    expect(style).toEqual(
      expect.objectContaining({
        writingDirection: 'rtl',
        textAlign: 'right',
      }),
    );
  });

  it('preserves an explicit score writing direction', () => {
    const { getByText } = render(
      <Text variant="header" style={{ writingDirection: 'ltr' }}>
        3 – 1
      </Text>,
    );
    const styles = getByText('3 – 1').props.style;

    expect(styles.at(-1)).toEqual(expect.objectContaining({ writingDirection: 'ltr' }));
  });
});
