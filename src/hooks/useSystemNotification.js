import { useState, useCallback } from 'react';

export const useSystemNotification = () => {
  const [notification, setNotification] = useState({
    isVisible: false,
    type: '',
    title: '',
    message: '',
    announcementData: null,
  });

  const showNotification = useCallback((type, title, message, announcementData = null) => {
    setNotification({
      isVisible: true,
      type,
      title,
      message,
      announcementData,
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
