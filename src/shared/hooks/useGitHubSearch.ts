import { useState, useCallback } from 'react';
import { searchGitHubUser, isGitHubAPIError } from '../services/github.service';
import { getCachedUser, cacheUser } from '../services/cache.service';
import type { GitHubUserSearchResult } from '../types/github.types';

export interface UseGitHubSearchState {
  loading: boolean;
  error: string | null;
  data: GitHubUserSearchResult | null;
}

export interface UseGitHubSearchReturn extends UseGitHubSearchState {
  search: (username: string) => Promise<GitHubUserSearchResult>;
  reset: () => void;
}

export const useGitHubSearch = (): UseGitHubSearchReturn => {
  const [state, setState] = useState<UseGitHubSearchState>({
    loading: false,
    error: null,
    data: null
  });

  const search = useCallback(async (username: string): Promise<GitHubUserSearchResult> => {
    const cached = getCachedUser(username);
    if (cached) {
      setState({ loading: false, error: null, data: cached });
      return cached;
    }

    setState({ loading: true, error: null, data: null });

    try {
      const result = await searchGitHubUser(username);
      cacheUser(result);
      setState({ loading: false, error: null, data: result });
      return result;
    } catch (err) {
      const errorMessage = isGitHubAPIError(err)
        ? err.message
        : 'An unexpected error occurred';

      setState({ loading: false, error: errorMessage, data: null });
      throw err;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ loading: false, error: null, data: null });
  }, []);

  return { ...state, search, reset };
};
