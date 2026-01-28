import {
  cacheUser,
  getCachedUser,
  getRecentUsers,
  clearCache,
  updateCachedUserRepos,
  cacheRepoDetails,
  getCachedRepoDetails,
} from './cache.service';
import type { GitHubUserSearchResult, GitHubRepositoryDetails, GitHubRepository } from '../types/github.types';

const createMockUser = (username: string): GitHubUserSearchResult => ({
  user: {
    login: username,
    name: `${username} Name`,
    avatar_url: `https://avatars.githubusercontent.com/${username}`,
    bio: 'Test bio',
    location: 'Test Location',
    followers: 100,
    following: 50,
    public_repos: 25,
    html_url: `https://github.com/${username}`,
  },
  repositories: [
    {
      id: 1,
      name: 'repo1',
      description: 'Test repo',
      stargazers_count: 10,
      html_url: `https://github.com/${username}/repo1`,
      language: 'TypeScript',
      updated_at: '2024-01-01T00:00:00Z',
      owner: { login: username },
    },
  ],
  totalStars: 10,
  fetchedAt: Date.now(),
  username,
  hasMoreRepos: false,
});

const createMockRepoDetails = (owner: string, name: string): GitHubRepositoryDetails => ({
  id: 1,
  name,
  full_name: `${owner}/${name}`,
  description: 'Test repository',
  stargazers_count: 100,
  html_url: `https://github.com/${owner}/${name}`,
  language: 'TypeScript',
  updated_at: '2024-01-01T00:00:00Z',
  owner: {
    login: owner,
    avatar_url: `https://avatars.githubusercontent.com/${owner}`,
  },
  forks_count: 50,
  watchers_count: 75,
  default_branch: 'main',
  created_at: '2023-01-01T00:00:00Z',
  topics: ['typescript', 'react'],
  homepage: 'https://example.com',
});

describe('cache.service', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  describe('cacheUser / getCachedUser', () => {
    it('should cache and retrieve a user', () => {
      const mockUser = createMockUser('testuser');
      cacheUser(mockUser);

      const cached = getCachedUser('testuser');
      expect(cached).not.toBeNull();
      expect(cached?.username).toBe('testuser');
      expect(cached?.user.login).toBe('testuser');
    });

    it('should return null for non-cached user', () => {
      const cached = getCachedUser('nonexistent');
      expect(cached).toBeNull();
    });

    it('should be case-insensitive', () => {
      const mockUser = createMockUser('TestUser');
      cacheUser(mockUser);

      const cached = getCachedUser('TESTUSER');
      expect(cached).not.toBeNull();
    });

    it('should limit cached users to MAX_CACHED_USERS (6)', () => {
      for (let i = 1; i <= 8; i++) {
        cacheUser(createMockUser(`user${i}`));
      }

      expect(getCachedUser('user1')).toBeNull();
      expect(getCachedUser('user2')).toBeNull();
      expect(getCachedUser('user3')).not.toBeNull();
      expect(getCachedUser('user8')).not.toBeNull();
    });

    it('should move re-cached user to front of order', () => {
      cacheUser(createMockUser('user1'));
      cacheUser(createMockUser('user2'));
      cacheUser(createMockUser('user3'));
      cacheUser(createMockUser('user1'));

      const recent = getRecentUsers();
      expect(recent[0].username).toBe('user1');
    });
  });

  describe('getRecentUsers', () => {
    it('should return empty array when no users cached', () => {
      const recent = getRecentUsers();
      expect(recent).toEqual([]);
    });

    it('should return users in order of most recently cached', () => {
      cacheUser(createMockUser('user1'));
      cacheUser(createMockUser('user2'));
      cacheUser(createMockUser('user3'));

      const recent = getRecentUsers();
      expect(recent).toHaveLength(3);
      expect(recent[0].username).toBe('user3');
      expect(recent[1].username).toBe('user2');
      expect(recent[2].username).toBe('user1');
    });
  });

  describe('clearCache', () => {
    it('should clear all cached users', () => {
      cacheUser(createMockUser('user1'));
      cacheUser(createMockUser('user2'));

      clearCache();

      expect(getCachedUser('user1')).toBeNull();
      expect(getCachedUser('user2')).toBeNull();
      expect(getRecentUsers()).toEqual([]);
    });
  });

  describe('updateCachedUserRepos', () => {
    it('should update repositories for cached user', () => {
      const mockUser = createMockUser('testuser');
      cacheUser(mockUser);

      const newRepos: GitHubRepository[] = [
        {
          id: 2,
          name: 'new-repo',
          description: 'New repo',
          stargazers_count: 50,
          html_url: 'https://github.com/testuser/new-repo',
          language: 'JavaScript',
          updated_at: '2024-02-01T00:00:00Z',
          owner: { login: 'testuser' },
        },
      ];

      updateCachedUserRepos('testuser', newRepos, true);

      const cached = getCachedUser('testuser');
      expect(cached?.repositories).toHaveLength(1);
      expect(cached?.repositories[0].name).toBe('new-repo');
      expect(cached?.hasMoreRepos).toBe(true);
    });

    it('should not update non-cached user', () => {
      const newRepos: GitHubRepository[] = [];
      updateCachedUserRepos('nonexistent', newRepos, false);
      expect(getCachedUser('nonexistent')).toBeNull();
    });
  });

  describe('cacheRepoDetails / getCachedRepoDetails', () => {
    it('should cache and retrieve repository details', () => {
      const mockRepo = createMockRepoDetails('owner', 'repo');
      cacheRepoDetails('owner', 'repo', mockRepo);

      const cached = getCachedRepoDetails('owner', 'repo');
      expect(cached).not.toBeNull();
      expect(cached?.name).toBe('repo');
      expect(cached?.full_name).toBe('owner/repo');
    });

    it('should return null for non-cached repo', () => {
      const cached = getCachedRepoDetails('nonexistent', 'repo');
      expect(cached).toBeNull();
    });

    it('should be case-insensitive', () => {
      const mockRepo = createMockRepoDetails('Owner', 'Repo');
      cacheRepoDetails('Owner', 'Repo', mockRepo);

      const cached = getCachedRepoDetails('OWNER', 'REPO');
      expect(cached).not.toBeNull();
    });

    it('should limit cached repos to MAX_CACHED_REPO_DETAILS (20)', () => {
      for (let i = 1; i <= 22; i++) {
        cacheRepoDetails('owner', `repo${i}`, createMockRepoDetails('owner', `repo${i}`));
      }

      expect(getCachedRepoDetails('owner', 'repo1')).toBeNull();
      expect(getCachedRepoDetails('owner', 'repo2')).toBeNull();
      expect(getCachedRepoDetails('owner', 'repo3')).not.toBeNull();
      expect(getCachedRepoDetails('owner', 'repo22')).not.toBeNull();
    });
  });
});
