import { useState, useEffect } from 'react';
import { isOnline, addOnlineListener, addOfflineListener } from '../services/network.service';

export const useOnlineStatus = () => {
  const [online, setOnline] = useState(isOnline());

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    const removeOnlineListener = addOnlineListener(handleOnline);
    const removeOfflineListener = addOfflineListener(handleOffline);

    return () => {
      removeOnlineListener();
      removeOfflineListener();
    };
  }, []);

  return online;
};
