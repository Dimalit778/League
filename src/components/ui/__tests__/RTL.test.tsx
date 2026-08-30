import { render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { Text } from '../Text';
import { ListItem } from '../ListItem';
import { Section } from '../../layout/Section';

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
      <Text variant="heading" size="3xl" style={{ writingDirection: 'ltr' }}>
        3 – 1
      </Text>,
    );
    const styles = getByText('3 – 1').props.style;

    expect(styles.at(-1)).toEqual(expect.objectContaining({ writingDirection: 'ltr' }));
  });

  it('right-aligns shared list item labels', () => {
    const { getByText } = render(<ListItem title="פרטי הליגה" trailing={<Text>ערך</Text>} />);
    const style = StyleSheet.flatten(getByText('פרטי הליגה').props.style);

    expect(style.textAlign).toBe('right');
  });

  it('right-aligns section headers', () => {
    const { getByText } = render(
      <Section title="סטטיסטיקה">
        <Text>תוכן</Text>
      </Section>,
    );
    const style = StyleSheet.flatten(getByText('סטטיסטיקה').props.style);

    expect(style.textAlign).toBe('right');
  });
});
