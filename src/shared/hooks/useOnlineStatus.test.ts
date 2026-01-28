import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useOnlineStatus } from './useOnlineStatus';
import * as networkService from '../services/network.service';

vi.mock('../services/network.service');

describe('useOnlineStatus', () => {
  let onlineCallback: (() => void) | null = null;
  let offlineCallback: (() => void) | null = null;

  beforeEach(() => {
    vi.clearAllMocks();
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

  it('should return initial online status from service', () => {
    vi.mocked(networkService.isOnline).mockReturnValue(true);
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(true);
  });

  it('should return false when initially offline', () => {
    vi.mocked(networkService.isOnline).mockReturnValue(false);
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(false);
  });

  it('should add event listeners on mount', () => {
    renderHook(() => useOnlineStatus());
    expect(networkService.addOnlineListener).toHaveBeenCalled();
    expect(networkService.addOfflineListener).toHaveBeenCalled();
  });

  it('should update status to true when online event is fired', () => {
    vi.mocked(networkService.isOnline).mockReturnValue(false);

    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(false);

    act(() => {
      onlineCallback?.();
    });

    expect(result.current).toBe(true);
  });

  it('should update status to false when offline event is fired', () => {
    vi.mocked(networkService.isOnline).mockReturnValue(true);

    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(true);

    act(() => {
      offlineCallback?.();
    });

    expect(result.current).toBe(false);
  });

  it('should remove event listeners on unmount', () => {
    const removeOnlineListener = vi.fn();
    const removeOfflineListener = vi.fn();
    vi.mocked(networkService.addOnlineListener).mockReturnValue(removeOnlineListener);
    vi.mocked(networkService.addOfflineListener).mockReturnValue(removeOfflineListener);

    const { unmount } = renderHook(() => useOnlineStatus());

    unmount();

    expect(removeOnlineListener).toHaveBeenCalled();
    expect(removeOfflineListener).toHaveBeenCalled();
  });
});
