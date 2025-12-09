import { useState, useCallback } from 'react';

export const useInputConfirm = () => {
  const [confirmDialog, setConfirmDialog] = useState(null);

  const showInputConfirm = useCallback((config) => {
    return new Promise((resolve) => {
      setConfirmDialog({
        ...config,
        onConfirm: () => {
          setConfirmDialog(null);
          resolve(true);
        },
        onCancel: () => {
          setConfirmDialog(null);
          resolve(false);
        },
      });
    });
  }, []);

  const hideInputConfirm = useCallback(() => {
    setConfirmDialog(null);
  }, []);

  return {
    confirmDialog,
    showInputConfirm,
    hideInputConfirm,
  };
};
