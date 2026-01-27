import type {
  GitHubUserSearchItem,
  GitHubUserDetails,
  GitHubRepository,
  GitHubSearchResult,
  GitHubUserSearchResult
} from '../types/github.types';

const GITHUB_API_BASE = 'https://api.github.com';
const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;

const getHeaders = () => ({
  'Authorization': `token ${GITHUB_TOKEN}`,
  'Accept': 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
  'User-Agent': 'GitHub-Search-App'
});

interface GitHubAPIError extends Error {
  status: number;
  isGitHubAPIError: true;
}

const createAPIError = (status: number, message: string): GitHubAPIError => {
  const error = new Error(message) as GitHubAPIError;
  error.name = 'GitHubAPIError';
  error.status = status;
  error.isGitHubAPIError = true;
  return error;
};

export const isGitHubAPIError = (error: unknown): error is GitHubAPIError => {
  return (error as GitHubAPIError)?.isGitHubAPIError === true;
};

interface GitHubSearchUsersResponse {
  total_count: number;
  incomplete_results: boolean;
  items: GitHubUserSearchItem[];
}

export const searchGitHubUsers = async (query: string, perPage: number = 10): Promise<GitHubSearchResult> => {
  const response = await fetch(
    `${GITHUB_API_BASE}/search/users?q=${encodeURIComponent(query)}&per_page=${perPage}`,
    { headers: getHeaders() }
  );

  if (!response.ok) {
    if (response.status === 403) {
      throw createAPIError(403, 'GitHub API rate limit exceeded');
    }
    if (response.status === 422) {
      throw createAPIError(422, 'Invalid search query');
    }
    throw createAPIError(response.status, 'Failed to search users');
  }

  const data: GitHubSearchUsersResponse = await response.json();

  return {
    users: data.items,
    total_count: data.total_count,
    fetchedAt: Date.now(),
    query
  };
};

export const fetchGitHubUserDetails = async (username: string): Promise<GitHubUserDetails> => {
  const response = await fetch(
    `${GITHUB_API_BASE}/users/${username}`,
    { headers: getHeaders() }
  );

  if (!response.ok) {
    if (response.status === 404) {
      throw createAPIError(404, `User "${username}" not found`);
    }
    if (response.status === 403) {
      throw createAPIError(403, 'GitHub API rate limit exceeded');
    }
    throw createAPIError(response.status, 'Failed to fetch user data');
  }

  return response.json();
};

export type RepoSortField = 'updated' | 'full_name';
export type SortDirection = 'asc' | 'desc';

export interface FetchReposOptions {
  page?: number;
  perPage?: number;
  sort?: RepoSortField;
  direction?: SortDirection;
}

export interface FetchReposResult {
  repositories: GitHubRepository[];
  hasMore: boolean;
}

export const fetchGitHubRepos = async (
  username: string,
  options: FetchReposOptions = {}
): Promise<FetchReposResult> => {
  const { page = 1, perPage = 10, sort = 'updated', direction = 'desc' } = options;

  const response = await fetch(
    `${GITHUB_API_BASE}/users/${username}/repos?sort=${sort}&direction=${direction}&per_page=${perPage}&page=${page}`,
    { headers: getHeaders() }
  );

  if (!response.ok) {
    throw createAPIError(response.status, 'Failed to fetch repositories');
  }

  const repositories: GitHubRepository[] = await response.json();
  const hasMore = repositories.length === perPage;

  return { repositories, hasMore };
};

export const searchGitHubUser = async (username: string): Promise<GitHubUserSearchResult> => {
  const [user, reposResult] = await Promise.all([
    fetchGitHubUserDetails(username),
    fetchGitHubRepos(username, { page: 1, perPage: 10 })
  ]);

  const totalStars = reposResult.repositories.reduce((sum, repo) => sum + repo.stargazers_count, 0);

  return {
    user,
    repositories: reposResult.repositories,
    totalStars,
    fetchedAt: Date.now(),
    username,
    hasMoreRepos: reposResult.hasMore
  };
};
