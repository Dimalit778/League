import {
  decodeAndValidateProfileImage,
  ProfileImageValidationError,
} from './profileImageValidation.ts';

const assert = (condition: boolean, message: string) => {
  if (!condition) throw new Error(message);
};

const toBase64 = (bytes: number[]) => {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
};

Deno.test('accepts image bytes whose signature matches the declared MIME type', () => {
  const jpeg = decodeAndValidateProfileImage(toBase64([0xff, 0xd8, 0xff, 0x00]), 'image/jpeg');
  const png = decodeAndValidateProfileImage(
    toBase64([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    'image/png',
  );
  const webp = decodeAndValidateProfileImage(
    toBase64([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50]),
    'image/webp',
  );

  assert(jpeg.length === 4, 'JPEG should decode');
  assert(png.length === 8, 'PNG should decode');
  assert(webp.length === 12, 'WebP should decode');
});

Deno.test('rejects malformed base64 before moderation', () => {
  try {
    decodeAndValidateProfileImage('not base64!', 'image/jpeg');
    throw new Error('expected malformed base64 to be rejected');
  } catch (error) {
    assert(error instanceof ProfileImageValidationError, 'expected a validation error');
    assert((error as ProfileImageValidationError).status === 400, 'expected HTTP 400');
  }
});

Deno.test('rejects a MIME type that does not match the image bytes', () => {
  try {
    decodeAndValidateProfileImage(toBase64([0xff, 0xd8, 0xff, 0x00]), 'image/png');
    throw new Error('expected mismatched content to be rejected');
  } catch (error) {
    assert(error instanceof ProfileImageValidationError, 'expected a validation error');
    assert((error as ProfileImageValidationError).status === 415, 'expected HTTP 415');
  }
});
