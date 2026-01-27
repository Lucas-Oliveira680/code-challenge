export interface GitHubUserSearchItem {
  id: number;
  login: string;
  avatar_url: string;
  html_url: string;
  type: string;
  score: number;
}

export interface GitHubUserDetails {
  login: string;
  name: string | null;
  avatar_url: string;
  bio: string | null;
  location: string | null;
  followers: number;
  following: number;
  public_repos: number;
  html_url: string;
}

export interface GitHubRepository {
  id: number;
  name: string;
  description: string | null;
  stargazers_count: number;
  html_url: string;
  language: string | null;
  updated_at: string;
  owner: {
    login: string;
  };
}

export interface GitHubRepositoryDetails extends GitHubRepository {
  full_name: string;
  owner: {
    login: string;
    avatar_url: string;
  };
  forks_count: number;
  watchers_count: number;
  default_branch: string;
  created_at: string;
  topics: string[];
  homepage: string | null;
}

export interface GitHubSearchResult {
  users: GitHubUserSearchItem[];
  total_count: number;
  fetchedAt: number;
  query: string;
}

export interface GitHubUserSearchResult {
  user: GitHubUserDetails;
  repositories: GitHubRepository[];
  totalStars: number;
  fetchedAt: number;
  username: string;
  hasMoreRepos: boolean;
}

export interface GitHubAPIError {
  message: string;
  status: number;
  documentation_url?: string;
}
