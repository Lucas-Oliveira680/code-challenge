import { renderHook, act, waitFor } from '@testing-library/react';
import { useGitHubSearch } from './useGitHubSearch';
import * as githubService from '../services/github.service';
import * as cacheService from '../services/cache.service';
import type { GitHubUserSearchResult } from '../types/github.types';

vi.mock('../services/github.service');
vi.mock('../services/cache.service');

const mockUserResult: GitHubUserSearchResult = {
  user: {
    login: 'testuser',
    name: 'Test User',
    avatar_url: 'https://avatars.githubusercontent.com/testuser',
    bio: 'Test bio',
    location: 'Test Location',
    followers: 100,
    following: 50,
    public_repos: 25,
    html_url: 'https://github.com/testuser',
  },
  repositories: [
    {
      id: 1,
      name: 'repo1',
      description: 'Test repo',
      stargazers_count: 10,
      html_url: 'https://github.com/testuser/repo1',
      language: 'TypeScript',
      updated_at: '2024-01-01T00:00:00Z',
      owner: { login: 'testuser' },
    },
  ],
  totalStars: 10,
  fetchedAt: Date.now(),
  username: 'testuser',
  hasMoreRepos: false,
};

describe('useGitHubSearch', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(cacheService.getCachedUser).mockReturnValue(null);
  });

  it('should have initial state', () => {
    const { result } = renderHook(() => useGitHubSearch());

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.data).toBeNull();
  });

  it('should return cached data if available', async () => {
    vi.mocked(cacheService.getCachedUser).mockReturnValue(mockUserResult);

    const { result } = renderHook(() => useGitHubSearch());

    await act(async () => {
      await result.current.search('testuser');
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toEqual(mockUserResult);
    expect(githubService.searchGitHubUser).not.toHaveBeenCalled();
  });

  it('should fetch and cache data when not in cache', async () => {
    vi.mocked(cacheService.getCachedUser).mockReturnValue(null);
    vi.mocked(githubService.searchGitHubUser).mockResolvedValue(mockUserResult);

    const { result } = renderHook(() => useGitHubSearch());

    await act(async () => {
      await result.current.search('testuser');
    });

    expect(githubService.searchGitHubUser).toHaveBeenCalledWith('testuser');
    expect(cacheService.cacheUser).toHaveBeenCalledWith(mockUserResult);
    expect(result.current.data).toEqual(mockUserResult);
  });

  it('should set loading state while fetching', async () => {
    vi.mocked(githubService.searchGitHubUser).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(mockUserResult), 100))
    );

    const { result } = renderHook(() => useGitHubSearch());

    let searchPromise: Promise<GitHubUserSearchResult>;
    act(() => {
      searchPromise = result.current.search('testuser');
    });

    expect(result.current.loading).toBe(true);

    await act(async () => {
      await searchPromise;
    });

    expect(result.current.loading).toBe(false);
  });

  it('should handle GitHub API errors', async () => {
    const apiError = {
      message: 'User not found',
      isGitHubAPIError: true,
    };

    vi.mocked(githubService.searchGitHubUser).mockRejectedValue(apiError);
    vi.mocked(githubService.isGitHubAPIError).mockReturnValue(true);

    const { result } = renderHook(() => useGitHubSearch());

    await act(async () => {
      try {
        await result.current.search('nonexistent');
      } catch {
        // Expected error
      }
    });

    expect(result.current.error).toBe('User not found');
    expect(result.current.data).toBeNull();
  });

  it('should handle generic errors', async () => {
    const error = new Error('Network error');

    vi.mocked(githubService.searchGitHubUser).mockRejectedValue(error);
    vi.mocked(githubService.isGitHubAPIError).mockReturnValue(false);

    const { result } = renderHook(() => useGitHubSearch());

    await act(async () => {
      try {
        await result.current.search('testuser');
      } catch {
        // Expected error
      }
    });

    expect(result.current.error).toBe('An unexpected error occurred');
  });

  it('should reset state', async () => {
    vi.mocked(githubService.searchGitHubUser).mockResolvedValue(mockUserResult);

    const { result } = renderHook(() => useGitHubSearch());

    await act(async () => {
      await result.current.search('testuser');
    });

    expect(result.current.data).not.toBeNull();

    act(() => {
      result.current.reset();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.data).toBeNull();
  });
});
