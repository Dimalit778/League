import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import Button from '../Button';

describe('Button', () => {
  it('renders the provided title', () => {
    const { getByText } = render(
      <Button title="Submit" onPress={jest.fn()} />
    );

    expect(getByText('Submit')).toBeTruthy();
  });

  it('invokes onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button title="Press me" onPress={onPress} />
    );

    fireEvent.press(getByText('Press me'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not invoke onPress when loading', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button title="Loading" onPress={onPress} loading />
    );

    fireEvent.press(getByText('Loading'));

    expect(onPress).not.toHaveBeenCalled();
  });
});
