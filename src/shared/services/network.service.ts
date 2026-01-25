export const isOnline = (): boolean => {
  return navigator.onLine;
};

export const addOnlineListener = (callback: () => void): (() => void) => {
  window.addEventListener('online', callback);
  return () => window.removeEventListener('online', callback);
};

export const addOfflineListener = (callback: () => void): (() => void) => {
  window.addEventListener('offline', callback);
  return () => window.removeEventListener('offline', callback);
};
