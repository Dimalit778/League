import { AlertDialog } from '@/components/ui/AlertDialog';
import { createContext, ReactNode, useContext, useState } from 'react';

export interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface AlertOptions {
  title: string;
  message?: string;
  buttons?: AlertButton[];
  type?: 'info' | 'warning' | 'success';
}

interface AlertContextType {
  showAlert: (options: AlertOptions) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider = ({ children }: { children: ReactNode }) => {
  const [alertState, setAlertState] = useState<{
    visible: boolean;
    options: AlertOptions | null;
  }>({
    visible: false,
    options: null,
  });

  const showAlert = (options: AlertOptions) => {
    setAlertState({
      visible: true,
      options,
    });
  };

  const hideAlert = () => {
    setAlertState({
      visible: false,
      options: null,
    });
  };

  const handleButtonPress = (button: AlertButton) => {
    hideAlert();
    button.onPress?.();
  };

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      <AlertDialog
        visible={alertState.visible}
        title={alertState.options?.title || ''}
        message={alertState.options?.message}
        buttons={alertState.options?.buttons || [{ text: 'OK', style: 'default' }]}
        type={alertState.options?.type || 'info'}
        onButtonPress={handleButtonPress}
        onDismiss={hideAlert}
      />
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};
// Helper function to replace Toast.toast calls
export const createAlertReplacer = (showAlert: (options: AlertOptions) => void) => ({
  alert: (title: string, message?: string, buttons?: AlertButton[], options?: any) => {
    // Determine alert type based on title or content
    let type: AlertOptions['type'] = 'info';
    const lowerTitle = title.toLowerCase();
    const lowerMessage = message?.toLowerCase() || '';

    if (
      lowerTitle.includes('error') ||
      lowerMessage.includes('error') ||
      lowerTitle.includes('failed') ||
      lowerMessage.includes('failed')
    ) {
      type = 'warning';
    } else if (
      lowerTitle.includes('success') ||
      lowerMessage.includes('success') ||
      lowerTitle.includes('copied') ||
      lowerMessage.includes('copied')
    ) {
      type = 'success';
    } else if (
      lowerTitle.includes('warning') ||
      lowerMessage.includes('warning') ||
      lowerTitle.includes('remove') ||
      lowerTitle.includes('delete') ||
      lowerMessage.includes('sure you want')
    ) {
      type = 'warning';
    }

    // Default buttons if none provided
    const defaultButtons: AlertButton[] = [
      {
        text: 'OK',
        style: 'default',
      },
    ];

    showAlert({
      title,
      message,
      buttons: buttons && buttons.length > 0 ? buttons : defaultButtons,
      type,
    });
  },
});
