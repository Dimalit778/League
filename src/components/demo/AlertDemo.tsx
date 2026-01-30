import { Button } from '@/components/ui';
import { useAlert } from '@/hooks/useAlert';
import React from 'react';
import { View } from 'react-native';

// Demo component to showcase all alert types
export const AlertDemo: React.FC = () => {
  const { showAlert } = useAlert();

  const showInfoAlert = () => {
    showAlert({
      title: 'Information',
      message: 'This is an informational message with useful details.',
      type: 'info',
      buttons: [{ text: 'Got it!' }],
    });
  };

  const showSuccessAlert = () => {
    showAlert({
      title: 'Success!',
      message: 'Your operation completed successfully.',
      type: 'success',
      buttons: [{ text: 'Awesome!' }],
    });
  };

  const showWarningAlert = () => {
    showAlert({
      title: 'Warning',
      message: 'This action cannot be undone. Are you sure?',
      type: 'warning',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Continue', style: 'default' },
      ],
    });
  };

  const showErrorAlert = () => {
    showAlert({
      title: 'Error',
      message: 'Something went wrong. Please try again later.',
      type: 'error',
      buttons: [{ text: 'OK' }],
    });
  };

  const showDestructiveAlert = () => {
    showAlert({
      title: 'Delete Account',
      message: 'This will permanently delete your account and all data.',
      type: 'warning',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete Forever', style: 'destructive', onPress: () => console.log('Deleted!') },
      ],
    });
  };

  return (
    <View style={{ padding: 20, gap: 12 }}>
      <Button title="Show Info Alert" onPress={showInfoAlert} variant="secondary" />
      <Button title="Show Success Alert" onPress={showSuccessAlert} variant="primary" />
      <Button title="Show Warning Alert" onPress={showWarningAlert} variant="secondary" />
      <Button title="Show Error Alert" onPress={showErrorAlert} variant="error" />
      <Button title="Show Destructive Alert" onPress={showDestructiveAlert} variant="error" />
    </View>
  );
};
