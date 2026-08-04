import { render } from '@testing-library/react-native';
import { Skeleton, TextSkeleton } from '../Skeleton';

describe('Skeleton', () => {
  it('applies className sizing on a layout View separate from the pulse wrapper', () => {
    const { getByTestId } = render(<Skeleton className="h-4 w-32" />);

    expect(getByTestId('skeleton-bone').props.className).toEqual(expect.stringContaining('h-4'));
    expect(getByTestId('skeleton-bone').props.className).toEqual(expect.stringContaining('w-32'));
    expect(getByTestId('skeleton-pulse').props.className).toBeUndefined();
  });

  it('keeps TextSkeleton defaults on the layout View', () => {
    const { getByTestId } = render(<TextSkeleton />);

    expect(getByTestId('skeleton-bone').props.className).toEqual(expect.stringContaining('h-4'));
    expect(getByTestId('skeleton-bone').props.className).toEqual(expect.stringContaining('w-32'));
  });
});
