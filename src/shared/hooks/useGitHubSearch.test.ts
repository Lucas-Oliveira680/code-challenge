import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useGitHubSearch } from './useGitHubSearch';
import * as githubService from '../services/github.service';
import * as cacheService from '../services/cache.service';

// Mock services
vi.mock('../services/github.service');
vi.mock('../services/cache.service');

const mockUser = {
  user: {
    login: 'testuser',
    avatar_url: 'url',
    bio: 'bio',
    name: 'Test User',
    followers: 10,
    following: 5,
    public_repos: 3,
    html_url: 'https://github.com/testuser',
    location: null,
  },
  repositories: [],
  totalStars: 0,
  fetchedAt: Date.now(),
  username: 'testuser',
  hasMoreRepos: false,
};

describe('useGitHubSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should have correct initial state', () => {
    const { result } = renderHook(() => useGitHubSearch());
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.data).toBeNull();
  });

  it('should return cached user data if available', async () => {
    vi.mocked(cacheService.getCachedUser).mockReturnValue(mockUser);
    const { result } = renderHook(() => useGitHubSearch());

    await act(async () => {
      await result.current.search('testuser');
    });

    expect(cacheService.getCachedUser).toHaveBeenCalledWith('testuser');
    expect(githubService.searchGitHubUser).not.toHaveBeenCalled();
    expect(result.current.data).toEqual(mockUser);
  });

  it('should search for a user and return data', async () => {
    vi.mocked(cacheService.getCachedUser).mockReturnValue(null);
    vi.mocked(githubService.searchGitHubUser).mockResolvedValue(mockUser);

    const { result } = renderHook(() => useGitHubSearch());

    await act(async () => {
      await result.current.search('testuser');
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toEqual(mockUser);
    expect(result.current.error).toBeNull();
    expect(githubService.searchGitHubUser).toHaveBeenCalledWith('testuser');
    expect(cacheService.cacheUser).toHaveBeenCalledWith(mockUser);
  });

  it('should handle API errors during search', async () => {
    const apiError = { message: 'User not found', isGitHubAPIError: true };
    vi.mocked(cacheService.getCachedUser).mockReturnValue(null);
    vi.mocked(githubService.searchGitHubUser).mockRejectedValue(apiError);
    vi.mocked(githubService.isGitHubAPIError).mockReturnValue(true);

    const { result } = renderHook(() => useGitHubSearch());

    await act(async () => {
      try {
        await result.current.search('nonexistent');
      } catch (e) {
        // Expected to throw
      }
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('User not found');
    expect(result.current.data).toBeNull();
  });

  it('should handle non-API errors during search', async () => {
    const error = new Error('Network error');
    vi.mocked(cacheService.getCachedUser).mockReturnValue(null);
    vi.mocked(githubService.searchGitHubUser).mockRejectedValue(error);
    vi.mocked(githubService.isGitHubAPIError).mockReturnValue(false);

    const { result } = renderHook(() => useGitHubSearch());

    await act(async () => {
      try {
        await result.current.search('testuser');
      } catch (e) {
        // Expected to throw
      }
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('An unexpected error occurred');
    expect(result.current.data).toBeNull();
  });

  it('should reset the state', () => {
    const { result } = renderHook(() => useGitHubSearch());

    act(() => {
        result.current.reset();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.data).toBeNull();
  });
});