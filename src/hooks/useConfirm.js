import { useState } from 'react';

export const useConfirm = () => {
  const [confirmState, setConfirmState] = useState(null);

  const showConfirm = ({ title, message, warningText, confirmText, cancelText, type }) => {
    return new Promise((resolve) => {
      setConfirmState({
        title,
        message,
        warningText,
        confirmText,
        cancelText,
        type,
        onConfirm: () => {
          setConfirmState(null);
          resolve(true);
        },
        onCancel: () => {
          setConfirmState(null);
          resolve(false);
        },
      });
    });
  };

  return { confirmState, showConfirm };
};
