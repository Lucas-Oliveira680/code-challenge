import type { GitHubUserSearchResult } from '../types/github.types';

const CACHE_KEY = 'github_user_cache';
const MAX_CACHED_USERS = 6;

export interface CachedUser {
  data: GitHubUserSearchResult;
  cachedAt: number;
}

interface UserCache {
  users: Record<string, CachedUser>;
  order: string[]; // Most recent first
}

const getCache = (): UserCache => {
  try {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch {
    // Invalid cache, reset it
  }
  return { users: {}, order: [] };
};

const saveCache = (cache: UserCache): void => {
  sessionStorage.setItem(CACHE_KEY, JSON.stringify(cache));
};

export const cacheUser = (data: GitHubUserSearchResult): void => {
  const cache = getCache();
  const username = data.username.toLowerCase();

  // Remove from order if already exists
  cache.order = cache.order.filter(u => u !== username);

  // Add to front of order
  cache.order.unshift(username);

  // Keep only MAX_CACHED_USERS
  if (cache.order.length > MAX_CACHED_USERS) {
    const removed = cache.order.pop();
    if (removed) {
      delete cache.users[removed];
    }
  }

  // Store the data
  cache.users[username] = {
    data,
    cachedAt: Date.now()
  };

  saveCache(cache);
};

export const getCachedUser = (username: string): GitHubUserSearchResult | null => {
  const cache = getCache();
  const cached = cache.users[username.toLowerCase()];
  return cached?.data ?? null;
};

export const getRecentUsers = (): GitHubUserSearchResult[] => {
  const cache = getCache();
  return cache.order
    .map(username => cache.users[username]?.data)
    .filter((data): data is GitHubUserSearchResult => data !== undefined);
};

export const clearCache = (): void => {
  sessionStorage.removeItem(CACHE_KEY);
};
