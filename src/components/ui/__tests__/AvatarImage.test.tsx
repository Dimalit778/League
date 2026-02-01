import { render } from '@testing-library/react-native';
import { AvatarImage } from '../AvatarImage';

jest.mock('@/lib/nativeWind', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

jest.mock('@/utils/getProfileImage', () => ({
  getProfileImage: (path?: string | null) =>
    path ? `https://example.com/storage/v1/object/public/profile_images/${path}` : null,
}));

describe('AvatarImage', () => {
  it('shows initial letter when no image path', () => {
    const { getByText } = render(<AvatarImage nickname="John" />);
    expect(getByText('J')).toBeTruthy();
  });

  it('shows ? when no nickname and no image', () => {
    const { getByText } = render(<AvatarImage />);
    expect(getByText('?')).toBeTruthy();
  });

  it('capitalizes the initial letter', () => {
    const { getByText } = render(<AvatarImage nickname="alice" />);
    expect(getByText('A')).toBeTruthy();
  });

  it('renders image when path is provided', () => {
    const { queryByText } = render(<AvatarImage nickname="John" path="avatar.jpg" />);
    // When image is provided, the initial letter should not be shown
    expect(queryByText('J')).toBeNull();
  });

  it('handles null nickname with path', () => {
    const { queryByText } = render(<AvatarImage nickname={null} path="avatar.jpg" />);
    expect(queryByText('?')).toBeNull();
  });
});
