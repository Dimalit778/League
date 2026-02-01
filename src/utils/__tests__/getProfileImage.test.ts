describe('getProfileImage', () => {
  const MOCK_URL = 'https://example.supabase.co';

  beforeEach(() => {
    jest.resetModules();
    process.env.EXPO_PUBLIC_SUPABASE_URL = MOCK_URL;
  });

  afterEach(() => {
    delete process.env.EXPO_PUBLIC_SUPABASE_URL;
  });

  it('returns full URL when path is provided', () => {
    const { getProfileImage } = require('../getProfileImage');
    const result = getProfileImage('avatar.jpg');
    expect(result).toBe(`${MOCK_URL}/storage/v1/object/public/profile_images/avatar.jpg`);
  });

  it('returns null when path is null', () => {
    const { getProfileImage } = require('../getProfileImage');
    expect(getProfileImage(null)).toBeNull();
  });

  it('returns null when path is undefined', () => {
    const { getProfileImage } = require('../getProfileImage');
    expect(getProfileImage(undefined)).toBeNull();
  });

  it('returns null when path is empty string', () => {
    const { getProfileImage } = require('../getProfileImage');
    expect(getProfileImage('')).toBeNull();
  });
});
