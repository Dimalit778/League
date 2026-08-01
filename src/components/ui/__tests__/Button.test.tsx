import { fireEvent, render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { Button } from '../Button';

describe('Button', () => {
  it('renders the provided label', () => {
    const { getByText } = render(<Button label="Submit" onPress={jest.fn()} />);

    expect(getByText('Submit')).toBeTruthy();
  });

  it('invokes onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button label="Press me" onPress={onPress} />);

    fireEvent.press(getByText('Press me'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not invoke onPress when loading', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <Button label="Loading" onPress={onPress} loading />
    );

    // When loading, the button shows ActivityIndicator instead of text
    const button = getByTestId('button');
    fireEvent.press(button);

    expect(onPress).not.toHaveBeenCalled();
  });

  it('renders icons before or after the label', () => {
    const { getByText, rerender } = render(
      <Button label="Next" leftIcon={<Text>+</Text>} onPress={jest.fn()} />,
    );

    expect(getByText('+')).toBeTruthy();
    expect(getByText('Next')).toBeTruthy();

    rerender(
      <Button label="Next" rightIcon={<Text>+</Text>} onPress={jest.fn()} />,
    );

    expect(getByText('+')).toBeTruthy();
  });

  it('supports an accessible icon-only button', () => {
    const { getByRole, getByText, queryByText } = render(
      <Button accessibilityLabel="Add" onPress={jest.fn()}>
        <Text>+</Text>
      </Button>,
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
