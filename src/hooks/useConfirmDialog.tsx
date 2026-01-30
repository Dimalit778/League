// src/hooks/useConfirmDialog.tsx
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useState } from 'react';
import { useToast } from 'react-native-toast-notifications';

interface ConfirmDialogProps {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

export function useConfirmDialog() {
  const [visible, setVisible] = useState(false);
  const [onConfirm, setOnConfirm] = useState<() => void>(() => {});
  const [dialogProps, setDialogProps] = useState<ConfirmDialogProps>({
    title: '',
    description: '',
    confirmLabel: 'Delete',
    cancelLabel: 'Cancel',
  });

  const toast = useToast();

  const show = (
    props: ConfirmDialogProps,
    callback: () => void,
    showToast?: { message: string; type?: 'success' | 'error' | 'info' },
  ) => {
    setDialogProps({
      ...props,
      confirmLabel: props.confirmLabel || 'Delete',
      cancelLabel: props.cancelLabel || 'Cancel',
    });
    setOnConfirm(() => () => {
      callback();
      if (showToast) {
        toast.show(showToast.message, { type: showToast.type || 'success' });
      }
    });
    setVisible(true);
  };

  const handleCancel = () => setVisible(false);
  const handleOk = () => {
    setVisible(false);
    onConfirm();
  };

  const DialogComponent = () => (
    <ConfirmDialog
      visible={visible}
      title={dialogProps.title}
      description={dialogProps.description}
      confirmLabel={dialogProps.confirmLabel}
      cancelLabel={dialogProps.cancelLabel}
      onConfirm={handleOk}
      onCancel={handleCancel}
    />
  );

  return { show, DialogComponent };
}
