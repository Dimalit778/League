export const MAX_PROFILE_IMAGE_BYTES = 5 * 1024 * 1024;

export const PROFILE_IMAGE_EXTENSIONS = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
} as const;

export type ProfileImageMimeType = keyof typeof PROFILE_IMAGE_EXTENSIONS;

export const normalizeProfileImageMimeType = (mimeType?: string | null): string | null => {
  if (!mimeType) return null;
  const lower = mimeType.toLowerCase();
  return lower === 'image/jpg' ? 'image/jpeg' : lower;
};

export const decodeAndValidateProfileImage = (
  base64: string,
  contentType: ProfileImageMimeType,
): Uint8Array => {
  // Reject malformed/oversized input before allocating the decoded buffer.
  const maximumEncodedLength = Math.ceil(MAX_PROFILE_IMAGE_BYTES / 3) * 4;
  if (
    base64.length > maximumEncodedLength ||
    base64.length % 4 !== 0 ||
    !/^[A-Za-z0-9+/]*={0,2}$/.test(base64)
  ) {
    throw new ProfileImageValidationError('Invalid base64 image data', 400);
  }

  let binary: string;
  try {
    binary = atob(base64);
  } catch {
    throw new ProfileImageValidationError('Invalid base64 image data', 400);
  }

  if (binary.length > MAX_PROFILE_IMAGE_BYTES) {
    throw new ProfileImageValidationError('Profile image must be 5 MB or smaller', 413);
  }

  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

  if (!matchesImageSignature(bytes, contentType)) {
    throw new ProfileImageValidationError('Image content does not match its file type', 415);
  }

  return bytes;
};

const matchesImageSignature = (bytes: Uint8Array, contentType: ProfileImageMimeType): boolean => {
  if (contentType === 'image/jpeg') {
    return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }

  if (contentType === 'image/png') {
    const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
    return bytes.length >= signature.length && signature.every((byte, index) => bytes[index] === byte);
  }

  return bytes.length >= 12 &&
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50;
};

export class ProfileImageValidationError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = 'ProfileImageValidationError';
  }
}
