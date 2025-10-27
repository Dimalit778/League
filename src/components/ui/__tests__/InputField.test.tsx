import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { useForm, FieldError } from 'react-hook-form';
import InputField from '../InputField';

type FormValues = {
  email: string;
};

const Wrapper = ({
  clearError,
  error,
}: {
  clearError?: () => void;
  error?: FieldError;
}) => {
  const { control } = useForm<FormValues>({
    defaultValues: { email: '' },
  });

  return (
    <InputField
      control={control}
      name="email"
      placeholder="Email"
      icon={<></>}
      clearError={clearError}
      error={error}
    />
  );
};

describe('InputField', () => {
  it('displays a validation message when provided', () => {
    const error: FieldError = {
      type: 'required',
      message: 'Email is required',
      ref: undefined,
    };
    const { getByText } = render(<Wrapper error={error} />);

    expect(getByText('Email is required')).toBeTruthy();
  });

  it('calls clearError when the user edits email or password fields', () => {
    const clearError = jest.fn();
    const { getByPlaceholderText } = render(
      <Wrapper clearError={clearError} />
    );

    fireEvent.changeText(getByPlaceholderText('Email'), 'user@example.com');

    expect(clearError).toHaveBeenCalledTimes(1);
  });
});
