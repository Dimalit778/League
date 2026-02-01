import { render } from '@testing-library/react-native';
import { Error } from '../Error';

describe('Error component', () => {
  it('renders a string error message', () => {
    const { getByText } = render(<Error error="Something went wrong" />);
    expect(getByText('Something went wrong')).toBeTruthy();
  });

  it('renders an Error object message', () => {
    const err = { message: 'Test error' };
    const { getByText } = render(<Error error={err} />);
    // formatErrorForUser processes unknown errors and returns their message
    expect(getByText('Test error')).toBeTruthy();
  });

  it('renders an object with a network error message', () => {
    const err = { message: 'Network request failed' };
    const { getByText } = render(<Error error={err} />);
    // formatErrorForUser should return a user-friendly network message
    expect(getByText(/connection/i)).toBeTruthy();
  });
});
