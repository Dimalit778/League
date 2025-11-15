import * as ImagePicker from 'expo-image-picker';

/**
 * Hook to manage image picker permissions for camera and media library
 * @returns Permission states and request functions
 */
export const useImagePickerPermissions = () => {
  const [cameraPermission, requestCameraPermission] =
    ImagePicker.useCameraPermissions();
  const [mediaLibraryPermission, requestMediaLibraryPermission] =
    ImagePicker.useMediaLibraryPermissions();

  /**
   * Check and request both camera and media library permissions if needed
   * @returns Promise that resolves when permissions are checked/requested
   */
  const checkPermissions = async (): Promise<boolean> => {
    const results = await Promise.all([
      cameraPermission?.granted
        ? Promise.resolve(true)
        : requestCameraPermission().then((result) => result.granted),
      mediaLibraryPermission?.granted
        ? Promise.resolve(true)
        : requestMediaLibraryPermission().then((result) => result.granted),
    ]);

    return results.every((granted) => granted === true);
  };

  return {
    cameraPermission,
    mediaLibraryPermission,
    checkPermissions,
    hasAllPermissions:
      cameraPermission?.granted === true &&
      mediaLibraryPermission?.granted === true,
  };
};
