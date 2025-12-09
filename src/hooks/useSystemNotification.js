import { useState, useCallback } from 'react';

export const useSystemNotification = () => {
  const [notification, setNotification] = useState({
    isVisible: false,
    type: '',
    title: '',
    message: '',
  });

  const showNotification = useCallback((type, title, message) => {
    setNotification({
      isVisible: true,
      type,
      title,
      message,
    });
  }, []);

  const hideNotification = useCallback(() => {
    setNotification((prev) => ({
      ...prev,
      isVisible: false,
    }));
  }, []);

  return {
    notification,
    showNotification,
    hideNotification,
  };
};
