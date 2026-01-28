import type { GitHubUserSearchResult, GitHubRepositoryDetails, GitHubRepository } from '../types/github.types';

const CACHE_KEY = 'github_user_cache';
const REPO_DETAILS_CACHE_KEY = 'github_repo_details_cache';
const MAX_CACHED_USERS = 6;
const MAX_CACHED_REPO_DETAILS = 20;

export interface CachedUser {
  data: GitHubUserSearchResult;
  cachedAt: number;
}

export interface CachedRepoDetails {
  data: GitHubRepositoryDetails;
  cachedAt: number;
}

interface UserCache {
  users: Record<string, CachedUser>;
  order: string[];
}

interface RepoDetailsCache {
  repos: Record<string, CachedRepoDetails>;
  order: string[];
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

const getRepoDetailsCache = (): RepoDetailsCache => {
  try {
    const cached = sessionStorage.getItem(REPO_DETAILS_CACHE_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch {
    // Invalid cache, reset it
  }
  return { repos: {}, order: [] };
};

const saveRepoDetailsCache = (cache: RepoDetailsCache): void => {
  sessionStorage.setItem(REPO_DETAILS_CACHE_KEY, JSON.stringify(cache));
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

export const updateCachedUserRepos = (username: string, repositories: GitHubRepository[], hasMoreRepos: boolean): void => {
  const cache = getCache();
  const key = username.toLowerCase();
  const cached = cache.users[key];

  if (cached) {
    cached.data.repositories = repositories;
    cached.data.hasMoreRepos = hasMoreRepos;
    cached.cachedAt = Date.now();
    saveCache(cache);
  }
};

export const cacheRepoDetails = (owner: string, repoName: string, data: GitHubRepositoryDetails): void => {
  const cache = getRepoDetailsCache();
  const key = `${owner.toLowerCase()}/${repoName.toLowerCase()}`;

  cache.order = cache.order.filter(k => k !== key);
  cache.order.unshift(key);

  if (cache.order.length > MAX_CACHED_REPO_DETAILS) {
    const removed = cache.order.pop();
    if (removed) {
      delete cache.repos[removed];
    }
  }

  cache.repos[key] = {
    data,
    cachedAt: Date.now()
  };

  saveRepoDetailsCache(cache);
};

export const getCachedRepoDetails = (owner: string, repoName: string): GitHubRepositoryDetails | null => {
  const cache = getRepoDetailsCache();
  const key = `${owner.toLowerCase()}/${repoName.toLowerCase()}`;
  return cache.repos[key]?.data ?? null;
};
