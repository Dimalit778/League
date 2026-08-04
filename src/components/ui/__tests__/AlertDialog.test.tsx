import { fireEvent, render } from '@testing-library/react-native';
import { AlertDialog } from '../AlertDialog';

const baseProps = {
  visible: true,
  title: 'Delete league?',
  message: 'This cannot be undone.',
  buttons: [
    { text: 'Cancel', style: 'cancel' as const },
    { text: 'Delete', style: 'destructive' as const },
  ],
  type: 'warning' as const,
  onButtonPress: jest.fn(),
  onDismiss: jest.fn(),
};

describe('AlertDialog', () => {
  it('re-applies theme vars inside the modal portal', () => {
    const { getByTestId } = render(<AlertDialog {...baseProps} />);

    expect(getByTestId('alert-theme').props.style).toBeTruthy();
  });

  it('does not put NativeWind className on animated shells', () => {
    const { getByTestId } = render(<AlertDialog {...baseProps} />);

    expect(getByTestId('alert-overlay').props.className).toBeUndefined();
    expect(getByTestId('alert-card').props.className).toBeUndefined();
  });

  it('renders title, message, and buttons', () => {
    const { getByText } = render(<AlertDialog {...baseProps} />);

    expect(getByText('Delete league?')).toBeTruthy();
    expect(getByText('This cannot be undone.')).toBeTruthy();
    expect(getByText('Cancel')).toBeTruthy();
    expect(getByText('Delete')).toBeTruthy();
  });

  it('invokes onButtonPress when a button is pressed', () => {
    const onButtonPress = jest.fn();
    const { getByText } = render(<AlertDialog {...baseProps} onButtonPress={onButtonPress} />);

    fireEvent.press(getByText('Delete'));

    expect(onButtonPress).toHaveBeenCalledWith(baseProps.buttons[1]);
  });
});
