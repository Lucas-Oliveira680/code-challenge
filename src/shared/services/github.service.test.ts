import {
  searchGitHubUsers,
  fetchGitHubUserDetails,
  fetchGitHubRepos,
  searchGitHubUser,
  fetchRepositoryDetails,
  isGitHubAPIError,
} from './github.service';

const mockUserSearchResponse = {
  total_count: 1,
  incomplete_results: false,
  items: [
    {
      id: 1,
      login: 'testuser',
      avatar_url: 'https://avatars.githubusercontent.com/testuser',
      html_url: 'https://github.com/testuser',
      type: 'User',
      score: 1,
    },
  ],
};

const mockUserDetails = {
  login: 'testuser',
  name: 'Test User',
  avatar_url: 'https://avatars.githubusercontent.com/testuser',
  bio: 'Test bio',
  location: 'Test Location',
  followers: 100,
  following: 50,
  public_repos: 25,
  html_url: 'https://github.com/testuser',
};

const mockRepos = [
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
  {
    id: 2,
    name: 'repo2',
    description: 'Test repo 2',
    stargazers_count: 20,
    html_url: 'https://github.com/testuser/repo2',
    language: 'JavaScript',
    updated_at: '2024-01-02T00:00:00Z',
    owner: { login: 'testuser' },
  },
];

const mockRepoDetails = {
  id: 1,
  name: 'repo1',
  full_name: 'testuser/repo1',
  description: 'Test repository',
  stargazers_count: 100,
  html_url: 'https://github.com/testuser/repo1',
  language: 'TypeScript',
  updated_at: '2024-01-01T00:00:00Z',
  owner: {
    login: 'testuser',
    avatar_url: 'https://avatars.githubusercontent.com/testuser',
  },
  forks_count: 50,
  watchers_count: 75,
  default_branch: 'main',
  created_at: '2023-01-01T00:00:00Z',
  topics: ['typescript', 'react'],
  homepage: 'https://example.com',
};

describe('github.service', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('isGitHubAPIError', () => {
    it('should return true for GitHub API errors', () => {
      const error = {
        message: 'Test error',
        status: 404,
        isGitHubAPIError: true,
      };
      expect(isGitHubAPIError(error)).toBe(true);
    });

    it('should return false for regular errors', () => {
      const error = new Error('Regular error');
      expect(isGitHubAPIError(error)).toBe(false);
    });

    it('should return false for null/undefined', () => {
      expect(isGitHubAPIError(null)).toBe(false);
      expect(isGitHubAPIError(undefined)).toBe(false);
    });
  });

  describe('searchGitHubUsers', () => {
    it('should search users successfully', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockUserSearchResponse),
      });

      const result = await searchGitHubUsers('testuser');

      expect(result.users).toHaveLength(1);
      expect(result.users[0].login).toBe('testuser');
      expect(result.total_count).toBe(1);
      expect(result.query).toBe('testuser');
    });

    it('should throw error on 403 rate limit', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
      });

      await expect(searchGitHubUsers('testuser')).rejects.toThrow(
        'Limite de requisições da API do GitHub excedido'
      );
    });

    it('should throw error on 422 invalid search', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 422,
      });

      await expect(searchGitHubUsers('')).rejects.toThrow('Busca inválida');
    });
  });

  describe('fetchGitHubUserDetails', () => {
    it('should fetch user details successfully', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockUserDetails),
      });

      const result = await fetchGitHubUserDetails('testuser');

      expect(result.login).toBe('testuser');
      expect(result.name).toBe('Test User');
    });

    it('should throw error on 404 not found', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
      });

      await expect(fetchGitHubUserDetails('nonexistent')).rejects.toThrow(
        'Usuário "nonexistent" não encontrado'
      );
    });

    it('should throw error on 403 rate limit', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
      });

      await expect(fetchGitHubUserDetails('testuser')).rejects.toThrow(
        'Limite de requisições da API do GitHub excedido'
      );
    });
  });

  describe('fetchGitHubRepos', () => {
    it('should fetch repos successfully', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockRepos),
      });

      const result = await fetchGitHubRepos('testuser');

      expect(result.repositories).toHaveLength(2);
      expect(result.repositories[0].name).toBe('repo1');
    });

    it('should indicate hasMore when repos equal perPage', async () => {
      const tenRepos = Array(10)
        .fill(null)
        .map((_, i) => ({ ...mockRepos[0], id: i, name: `repo${i}` }));

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(tenRepos),
      });

      const result = await fetchGitHubRepos('testuser', { perPage: 10 });

      expect(result.hasMore).toBe(true);
    });

    it('should indicate no more when repos less than perPage', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockRepos),
      });

      const result = await fetchGitHubRepos('testuser', { perPage: 10 });

      expect(result.hasMore).toBe(false);
    });

    it('should use pagination options', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockRepos),
      });

      await fetchGitHubRepos('testuser', {
        page: 2,
        perPage: 5,
        sort: 'full_name',
        direction: 'asc',
      });

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('page=2'),
        expect.any(Object)
      );
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('per_page=5'),
        expect.any(Object)
      );
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('sort=full_name'),
        expect.any(Object)
      );
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('direction=asc'),
        expect.any(Object)
      );
    });
  });

  describe('searchGitHubUser', () => {
    it('should fetch user with repos and calculate total stars', async () => {
      globalThis.fetch = vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockUserDetails),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockRepos),
        });

      const result = await searchGitHubUser('testuser');

      expect(result.user.login).toBe('testuser');
      expect(result.repositories).toHaveLength(2);
      expect(result.totalStars).toBe(30);
      expect(result.username).toBe('testuser');
    });
  });

  describe('fetchRepositoryDetails', () => {
    it('should fetch repository details successfully', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockRepoDetails),
      });

      const result = await fetchRepositoryDetails('testuser', 'repo1');

      expect(result.name).toBe('repo1');
      expect(result.full_name).toBe('testuser/repo1');
      expect(result.topics).toContain('typescript');
    });

    it('should throw error on 404 not found', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
      });

      await expect(fetchRepositoryDetails('testuser', 'nonexistent')).rejects.toThrow(
        'Repositório não encontrado'
      );
    });

    it('should throw error on 403 rate limit', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
      });

      await expect(fetchRepositoryDetails('testuser', 'repo1')).rejects.toThrow(
        'Limite de requisições da API do GitHub excedido'
      );
    });
  });
});
