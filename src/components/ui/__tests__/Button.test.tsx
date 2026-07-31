import { fireEvent, render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { Button } from '../Button';

describe('Button', () => {
  it('renders the provided title', () => {
    const { getByText } = render(<Button title="Submit" onPress={jest.fn()} />);

    expect(getByText('Submit')).toBeTruthy();
  });

  it('invokes onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button title="Press me" onPress={onPress} />);

    fireEvent.press(getByText('Press me'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not invoke onPress when loading', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <Button title="Loading" onPress={onPress} loading />
    );

    // When loading, the button shows ActivityIndicator instead of text
    const button = getByTestId('button');
    fireEvent.press(button);

    expect(onPress).not.toHaveBeenCalled();
  });

  it('renders an icon before or after the title', () => {
    const { getByText, rerender } = render(
      <Button title="Next" icon={<Text>+</Text>} onPress={jest.fn()} />,
    );

    expect(getByText('+')).toBeTruthy();
    expect(getByText('Next')).toBeTruthy();

    rerender(
      <Button title="Next" icon={<Text>+</Text>} iconPosition="end" onPress={jest.fn()} />,
    );

    expect(getByText('+')).toBeTruthy();
  });

  it('supports an accessible icon-only button', () => {
    const { getByRole, getByText, queryByText } = render(
      <Button icon={<Text>+</Text>} accessibilityLabel="Add" onPress={jest.fn()} />,
    );

    expect(getByRole('button', { name: 'Add' })).toBeTruthy();
    expect(getByText('+')).toBeTruthy();
    expect(queryByText('Add')).toBeNull();
  });

  it('supports the additive label API and busy accessibility state', () => {
    const { getByRole } = render(<Button label="Save" loading onPress={jest.fn()} />);

    expect(getByRole('button', { name: 'Save' }).props.accessibilityState).toEqual({
      busy: true,
      disabled: true,
    });
  });
});
