import { isOnline, addOnlineListener, addOfflineListener } from './network.service';

describe('network.service', () => {
  const originalNavigator = window.navigator;

  beforeEach(() => {
    Object.defineProperty(window, 'navigator', {
      value: { onLine: true },
      writable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'navigator', {
      value: originalNavigator,
      writable: true,
    });
  });

  describe('isOnline', () => {
    it('should return true when online', () => {
      Object.defineProperty(window.navigator, 'onLine', { value: true });
      expect(isOnline()).toBe(true);
    });

    it('should return false when offline', () => {
      Object.defineProperty(window.navigator, 'onLine', { value: false });
      expect(isOnline()).toBe(false);
    });
  });

  describe('addOnlineListener', () => {
    it('should add and remove online event listener', () => {
      const callback = vi.fn();
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      const cleanup = addOnlineListener(callback);

      expect(addEventListenerSpy).toHaveBeenCalledWith('online', callback);

      cleanup();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('online', callback);
    });
  });

  describe('addOfflineListener', () => {
    it('should add and remove offline event listener', () => {
      const callback = vi.fn();
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      const cleanup = addOfflineListener(callback);

      expect(addEventListenerSpy).toHaveBeenCalledWith('offline', callback);

      cleanup();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('offline', callback);
    });
  });
});
