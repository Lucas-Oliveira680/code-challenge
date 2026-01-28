import { renderHook, act } from '@testing-library/react';
import { useOnlineStatus } from './useOnlineStatus';
import * as networkService from '../services/network.service';

vi.mock('../services/network.service');

describe('useOnlineStatus', () => {
  let onlineCallback: (() => void) | null = null;
  let offlineCallback: (() => void) | null = null;

  beforeEach(() => {
    onlineCallback = null;
    offlineCallback = null;

    vi.mocked(networkService.isOnline).mockReturnValue(true);
    vi.mocked(networkService.addOnlineListener).mockImplementation((cb) => {
      onlineCallback = cb;
      return vi.fn();
    });
    vi.mocked(networkService.addOfflineListener).mockImplementation((cb) => {
      offlineCallback = cb;
      return vi.fn();
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should return initial online status', () => {
    vi.mocked(networkService.isOnline).mockReturnValue(true);

    const { result } = renderHook(() => useOnlineStatus());

    expect(result.current).toBe(true);
  });

  it('should return false when initially offline', () => {
    vi.mocked(networkService.isOnline).mockReturnValue(false);

    const { result } = renderHook(() => useOnlineStatus());

    expect(result.current).toBe(false);
  });

  it('should update to online when online event fires', () => {
    vi.mocked(networkService.isOnline).mockReturnValue(false);

    const { result } = renderHook(() => useOnlineStatus());

    expect(result.current).toBe(false);

    act(() => {
      onlineCallback?.();
    });

    expect(result.current).toBe(true);
  });

  it('should update to offline when offline event fires', () => {
    vi.mocked(networkService.isOnline).mockReturnValue(true);

    const { result } = renderHook(() => useOnlineStatus());

    expect(result.current).toBe(true);

    act(() => {
      offlineCallback?.();
    });

    expect(result.current).toBe(false);
  });

  it('should cleanup listeners on unmount', () => {
    const cleanupOnline = vi.fn();
    const cleanupOffline = vi.fn();

    vi.mocked(networkService.addOnlineListener).mockReturnValue(cleanupOnline);
    vi.mocked(networkService.addOfflineListener).mockReturnValue(cleanupOffline);

    const { unmount } = renderHook(() => useOnlineStatus());

    unmount();

    expect(cleanupOnline).toHaveBeenCalled();
    expect(cleanupOffline).toHaveBeenCalled();
  });
});
