import { render, screen, waitFor } from '../../test/test-utils';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Search } from './Search';
import * as githubService from '@shared/services/github.service';
import * as cacheService from '@shared/services/cache.service';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('@shared/services/github.service');
vi.mock('@shared/services/cache.service');

const mockSearchResult = {
  users: [
    {
      id: 1,
      login: 'testuser',
      avatar_url: 'https://avatars.githubusercontent.com/testuser',
      html_url: 'https://github.com/testuser',
      type: 'User',
      score: 42.5,
    },
  ],
  total_count: 1,
  fetchedAt: Date.now(),
  query: 'test',
};

describe('Search', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(cacheService.getRecentUsers).mockReturnValue([]);
  });

  it('should render search page with heading', () => {
    render(<Search />);

    expect(screen.getByRole('heading', { name: /github explorer/i })).toBeInTheDocument();
  });

  it('should render searchbar', () => {
    render(<Search />);

    expect(screen.getByRole('searchbox')).toBeInTheDocument();
  });

  it('should show loading state while searching', async () => {
    const user = userEvent.setup();
    vi.mocked(githubService.searchGitHubUsers).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(mockSearchResult), 100))
    );

    render(<Search />);

    const input = screen.getByRole('searchbox');
    await user.type(input, 'test');
    await user.click(screen.getByRole('button', { name: /buscar/i }));

    await waitFor(() => {
      expect(screen.getByText(/buscando usuários/i)).toBeInTheDocument();
    });
  });

  it('should display search results', async () => {
    const user = userEvent.setup();
    vi.mocked(githubService.searchGitHubUsers).mockResolvedValue(mockSearchResult);

    render(<Search />);

    const input = screen.getByRole('searchbox');
    await user.type(input, 'test');
    await user.click(screen.getByRole('button', { name: /buscar/i }));

    await waitFor(() => {
      expect(screen.getByText('testuser')).toBeInTheDocument();
    });
  });

  it('should show empty message when no results', async () => {
    const user = userEvent.setup();
    vi.mocked(githubService.searchGitHubUsers).mockResolvedValue({
      ...mockSearchResult,
      users: [],
    });

    render(<Search />);

    const input = screen.getByRole('searchbox');
    await user.type(input, 'nonexistent');
    await user.click(screen.getByRole('button', { name: /buscar/i }));

    await waitFor(() => {
      const emptyMessages = screen.getAllByText(/nenhum usuário encontrado/i);
      expect(emptyMessages.length).toBeGreaterThan(0);
    });
  });

  it('should show toast on error', async () => {
    const user = userEvent.setup();
    vi.mocked(githubService.searchGitHubUsers).mockRejectedValue(new Error('API Error'));

    render(<Search />);

    const input = screen.getByRole('searchbox');
    await user.type(input, 'test');
    await user.click(screen.getByRole('button', { name: /buscar/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('API Error');
    });
  });

  it('should navigate to results when user is selected', async () => {
    const user = userEvent.setup();
    vi.mocked(githubService.searchGitHubUsers).mockResolvedValue(mockSearchResult);

    render(<Search />);

    const input = screen.getByRole('searchbox');
    await user.type(input, 'test');
    await user.click(screen.getByRole('button', { name: /buscar/i }));

    await waitFor(() => {
      expect(screen.getByText('testuser')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /ver perfil de testuser/i }));

    expect(mockNavigate).toHaveBeenCalledWith('/results?username=testuser');
  });

  it('should show recent searches when not searched', () => {
    const recentUsers = [
      {
        user: {
          login: 'recentuser',
          name: 'Recent User',
          avatar_url: 'https://avatars.githubusercontent.com/recentuser',
          bio: null,
          location: null,
          followers: 10,
          following: 5,
          public_repos: 3,
          html_url: 'https://github.com/recentuser',
        },
        repositories: [],
        totalStars: 0,
        fetchedAt: Date.now(),
        username: 'recentuser',
        hasMoreRepos: false,
      },
    ];
    vi.mocked(cacheService.getRecentUsers).mockReturnValue(recentUsers);

    render(<Search />);

    expect(screen.getByText('Buscas Recentes')).toBeInTheDocument();
    expect(screen.getByText('recentuser')).toBeInTheDocument();
  });

  it('should hide recent searches after search', async () => {
    const user = userEvent.setup();
    vi.mocked(githubService.searchGitHubUsers).mockResolvedValue(mockSearchResult);
    vi.mocked(cacheService.getRecentUsers).mockReturnValue([]);

    render(<Search />);

    const input = screen.getByRole('searchbox');
    await user.type(input, 'test');
    await user.click(screen.getByRole('button', { name: /buscar/i }));

    await waitFor(() => {
      expect(screen.queryByText('Buscas Recentes')).not.toBeInTheDocument();
    });
  });

  it('should close toast when close button is clicked', async () => {
    const user = userEvent.setup();
    vi.mocked(githubService.searchGitHubUsers).mockRejectedValue(new Error('API Error'));

    render(<Search />);

    const input = screen.getByRole('searchbox');
    await user.type(input, 'test');
    await user.click(screen.getByRole('button', { name: /buscar/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /fechar/i }));

    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });
});
