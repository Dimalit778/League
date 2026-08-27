import { render } from '@testing-library/react-native';
import { FormattedText, parseBoldMarks } from '../FormattedText';

describe('parseBoldMarks', () => {
  it('keeps plain text unchanged', () => {
    expect(parseBoldMarks('plain text')).toEqual([{ type: 'text', value: 'plain text' }]);
  });

  it('splits **bold** segments', () => {
    expect(parseBoldMarks('On **My Leagues** tap **Create League**')).toEqual([
      { type: 'text', value: 'On ' },
      { type: 'bold', value: 'My Leagues' },
      { type: 'text', value: ' tap ' },
      { type: 'bold', value: 'Create League' },
    ]);
  });
});

describe('FormattedText', () => {
  it('renders bold segments without markdown markers', () => {
    const { getByText, queryByText } = render(
      <FormattedText>On **My Leagues** tap **Create League**</FormattedText>,
    );

    expect(getByText('My Leagues')).toBeTruthy();
    expect(getByText('Create League')).toBeTruthy();
    expect(queryByText('**My Leagues**')).toBeNull();
  });
});
