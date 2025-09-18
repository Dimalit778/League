import { FontAwesome } from '@expo/vector-icons';
import * as ExpoImagePicker from 'expo-image-picker';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';

export type PickedImage = {
  uri: string;
  fileName?: string | null;
  mimeType?: string | null;
  width?: number;
  height?: number;
};

type ImagePickerButtonProps = {
  onPicked: (image: PickedImage) => void;
  allowCamera?: boolean;
  allowLibrary?: boolean;
  allowsEditing?: boolean;
  aspect?: [number, number];
  quality?: number;
  className?: string;
  style?: ViewStyle;
  disabled?: boolean;
  loading?: boolean;
  accessibilityLabel?: string;
  iconSize?: number;
  iconColor?: string;
};

const ImagePickerButton = ({
  onPicked,
  allowCamera = true,
  allowLibrary = true,
  allowsEditing = true,
  aspect = [1, 1],
  quality = 0.8,
  className = 'bg-primary rounded-full w-8 h-8 items-center justify-center border border-border',
  style,
  disabled,
  loading,
  accessibilityLabel = 'Select image',
  iconSize = 14,
  iconColor = '#fff',
}: ImagePickerButtonProps) => {
  const [busy, setBusy] = useState(false);

  const pickFromLibrary = async () => {
    const permission =
      await ExpoImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'We need access to your photos.');
      return;
    }
    const result = await ExpoImagePicker.launchImageLibraryAsync({
      mediaTypes: ExpoImagePicker.MediaTypeOptions.Images,
      allowsEditing,
      aspect,
      quality,
    });
    if (!result.canceled && result.assets?.[0]) {
      const a = result.assets[0];
      onPicked({
        uri: a.uri,
        fileName: a.fileName ?? null,
        mimeType: a.mimeType ?? null,
        width: a.width,
        height: a.height,
      });
    }
  };

  const pickFromCamera = async () => {
    const permission = await ExpoImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Camera access is required.');
      return;
    }
    const result = await ExpoImagePicker.launchCameraAsync({
      mediaTypes: ExpoImagePicker.MediaTypeOptions.Images,
      allowsEditing,
      aspect,
      quality,
    });
    if (!result.canceled && result.assets?.[0]) {
      const a = result.assets[0];
      onPicked({
        uri: a.uri,
        fileName: a.fileName ?? null,
        mimeType: a.mimeType ?? null,
        width: a.width,
        height: a.height,
      });
    }
  };

  const handlePress = async () => {
    if (disabled || loading || busy) return;
    try {
      setBusy(true);
      if (allowCamera && allowLibrary) {
        Alert.alert(
          'Select Image',
          'Choose an option',
          [
            { text: 'Camera', onPress: pickFromCamera },
            { text: 'Photo Library', onPress: pickFromLibrary },
            { text: 'Cancel', style: 'cancel' },
          ],
          { cancelable: true }
        );
      } else if (allowCamera) {
        await pickFromCamera();
      } else if (allowLibrary) {
        await pickFromLibrary();
      }
    } finally {
      setBusy(false);
    }
  };

  const showSpinner = loading || busy;

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || showSpinner}
      accessibilityLabel={accessibilityLabel}
      className={`${className} ${showSpinner ? 'opacity-80' : ''}`}
      style={[{ elevation: 4 }, style]}
      hitSlop={{ top: 6, right: 6, bottom: 6, left: 6 }}
    >
      {showSpinner ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <FontAwesome name="plus" size={iconSize} color={iconColor} />
      )}
    </TouchableOpacity>
  );
};

export default ImagePickerButton;
