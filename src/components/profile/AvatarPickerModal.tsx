import React, { useCallback, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

type PickedAsset = {
  uri: string;
  mimeType?: string | null;
  fileName?: string | null;
};

type AvatarPickerModalProps = {
  visible: boolean;
  onCancel: () => void;
  onSave: (asset: PickedAsset) => Promise<void> | void;
  initialImageUrl?: string | null;
};

const AvatarPickerModal = ({
  visible,
  onCancel,
  onSave,
  initialImageUrl,
}: AvatarPickerModalProps) => {
  const [picked, setPicked] = useState<PickedAsset | null>(null);
  const [isPicking, setIsPicking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const reset = useCallback(() => {
    setPicked(null);
    setIsPicking(false);
    setIsSaving(false);
  }, []);

  const handleCancel = useCallback(() => {
    reset();
    onCancel();
  }, [onCancel, reset]);

  const pickImage = useCallback(async () => {
    try {
      setIsPicking(true);
      // Request permission if needed
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        setIsPicking(false);
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
        aspect: [1, 1],
      });
      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        setPicked({
          uri: asset.uri,
          mimeType: asset.mimeType || null,
          fileName: asset.fileName || null,
        });
      }
    } finally {
      setIsPicking(false);
    }
  }, []);

  const handleSave = useCallback(async () => {
    if (!picked) return;
    try {
      setIsSaving(true);
      await onSave(picked);
      reset();
    } finally {
      setIsSaving(false);
    }
  }, [onSave, picked, reset]);

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={handleCancel}>
      <View className="flex-1 bg-black/50 items-center justify-center px-6">
        <View className="w-full bg-surface border border-border rounded-2xl p-4">
          {!picked ? (
            <View>
              <Text className="text-text text-lg font-bold mb-4">Change profile photo</Text>
              {initialImageUrl ? (
                <View className="items-center mb-4">
                  <Image
                    source={{ uri: initialImageUrl }}
                    style={{ width: 120, height: 120, borderRadius: 60, borderWidth: 1 }}
                  />
                </View>
              ) : null}
              <View className="flex-row justify-end">
                <TouchableOpacity
                  onPress={handleCancel}
                  className="px-4 py-2 rounded-md border border-border mr-2"
                  disabled={isPicking}
                >
                  <Text className="text-text">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={pickImage}
                  className="px-4 py-2 rounded-md bg-primary"
                  disabled={isPicking}
                >
                  {isPicking ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text className="text-background">Choose Image</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View>
              <Text className="text-text text-lg font-bold mb-4">Preview</Text>
              <View className="items-center mb-4">
                <Image
                  source={{ uri: picked.uri }}
                  style={{ width: 160, height: 160, borderRadius: 80, borderWidth: 1 }}
                />
              </View>
              <View className="flex-row justify-end">
                <TouchableOpacity
                  onPress={handleCancel}
                  className="px-4 py-2 rounded-md border border-border mr-2"
                  disabled={isSaving}
                >
                  <Text className="text-text">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSave}
                  className="px-4 py-2 rounded-md bg-primary"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text className="text-background">Save</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default AvatarPickerModal;

