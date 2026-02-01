import { fireEvent, render } from '@testing-library/react-native';
import { ConfirmDialog } from '../ConfirmDialog';

describe('ConfirmDialog', () => {
  const defaultProps = {
    visible: true,
    title: 'Delete Item',
    description: 'Are you sure you want to delete this item?',
    onConfirm: jest.fn(),
    onCancel: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders title and description when visible', () => {
    const { getByText } = render(<ConfirmDialog {...defaultProps} />);
    expect(getByText('Delete Item')).toBeTruthy();
    expect(getByText('Are you sure you want to delete this item?')).toBeTruthy();
  });

  it('renders default button labels', () => {
    const { getByText } = render(<ConfirmDialog {...defaultProps} />);
    expect(getByText('Confirm')).toBeTruthy();
    expect(getByText('Cancel')).toBeTruthy();
  });

  it('renders custom button labels', () => {
    const { getByText } = render(
      <ConfirmDialog {...defaultProps} confirmLabel="Yes, Delete" cancelLabel="No, Keep" />
    );
    expect(getByText('Yes, Delete')).toBeTruthy();
    expect(getByText('No, Keep')).toBeTruthy();
  });

  it('calls onConfirm when confirm button is pressed', () => {
    const onConfirm = jest.fn();
    const { getByText } = render(<ConfirmDialog {...defaultProps} onConfirm={onConfirm} />);

    fireEvent.press(getByText('Confirm'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when cancel button is pressed', () => {
    const onCancel = jest.fn();
    const { getByText } = render(<ConfirmDialog {...defaultProps} onCancel={onCancel} />);

    fireEvent.press(getByText('Cancel'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
