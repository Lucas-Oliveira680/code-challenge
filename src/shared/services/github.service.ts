import type {
  GitHubUserSearchItem,
  GitHubUserDetails,
  GitHubRepository,
  GitHubSearchResult,
  GitHubUserSearchResult
} from '../types/github.types';

const GITHUB_API_BASE = 'https://api.github.com';
const GITHUB_TOKEN = '';

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

export const fetchGitHubRepos = async (username: string): Promise<GitHubRepository[]> => {
  const response = await fetch(
    `${GITHUB_API_BASE}/users/${username}/repos?sort=updated&per_page=100`,
    { headers: getHeaders() }
  );

  if (!response.ok) {
    throw createAPIError(response.status, 'Failed to fetch repositories');
  }

  return response.json();
};

export const searchGitHubUser = async (username: string): Promise<GitHubUserSearchResult> => {
  const [user, repositories] = await Promise.all([
    fetchGitHubUserDetails(username),
    fetchGitHubRepos(username)
  ]);

  const totalStars = repositories.reduce((sum, repo) => sum + repo.stargazers_count, 0);

  return {
    user,
    repositories,
    totalStars,
    fetchedAt: Date.now(),
    username
  };
};
