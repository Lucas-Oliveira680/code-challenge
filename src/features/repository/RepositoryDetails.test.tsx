import { render, screen, waitFor } from '../../test/test-utils';
import userEvent from '@testing-library/user-event';
import { RepositoryDetails } from './RepositoryDetails';
import * as githubService from '@shared/services/github.service';
import * as cacheService from '@shared/services/cache.service';
import type { GitHubRepositoryDetails } from '@shared/types/github.types';

const mockNavigate = vi.fn();
let mockSearchParams = new URLSearchParams('owner=testuser&repo=test-repo');

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [mockSearchParams],
  };
});

vi.mock('@shared/services/github.service');
vi.mock('@shared/services/cache.service');

const mockRepoDetails: GitHubRepositoryDetails = {
  id: 1,
  name: 'test-repo',
  full_name: 'testuser/test-repo',
  description: 'A test repository',
  stargazers_count: 100,
  html_url: 'https://github.com/testuser/test-repo',
  language: 'TypeScript',
  updated_at: '2024-01-15T00:00:00Z',
  owner: {
    login: 'testuser',
    avatar_url: 'https://avatars.githubusercontent.com/testuser',
  },
  forks_count: 50,
  watchers_count: 75,
  default_branch: 'main',
  created_at: '2023-01-01T00:00:00Z',
  topics: ['typescript', 'react', 'testing'],
  homepage: 'https://example.com',
};

describe('RepositoryDetails', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockSearchParams = new URLSearchParams('owner=testuser&repo=test-repo');
    vi.mocked(cacheService.getCachedRepoDetails).mockReturnValue(null);
  });

  it('should show loading state initially', () => {
    vi.mocked(githubService.fetchRepositoryDetails).mockImplementation(
      () => new Promise(() => {})
    );

    render(<RepositoryDetails />);

    expect(screen.getByText('Carregando detalhes do repositório...')).toBeInTheDocument();
    expect(screen.getByRole('main')).toHaveAttribute('aria-busy', 'true');
  });

  it('should redirect to home if owner is missing', () => {
    mockSearchParams = new URLSearchParams('repo=test-repo');
    vi.mocked(githubService.fetchRepositoryDetails).mockResolvedValue(mockRepoDetails);

    render(<RepositoryDetails />);

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('should redirect to home if repo is missing', () => {
    mockSearchParams = new URLSearchParams('owner=testuser');
    vi.mocked(githubService.fetchRepositoryDetails).mockResolvedValue(mockRepoDetails);

    render(<RepositoryDetails />);

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('should render repository details when loaded', async () => {
    vi.mocked(githubService.fetchRepositoryDetails).mockResolvedValue(mockRepoDetails);

    render(<RepositoryDetails />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'test-repo' })).toBeInTheDocument();
    });

    expect(screen.getByText('A test repository')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('main')).toBeInTheDocument();
  });

  it('should render statistics', async () => {
    vi.mocked(githubService.fetchRepositoryDetails).mockResolvedValue(mockRepoDetails);

    render(<RepositoryDetails />);

    await waitFor(() => {
      expect(screen.getByText('100')).toBeInTheDocument();
    });

    expect(screen.getByText('estrelas')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
    expect(screen.getByText('forks')).toBeInTheDocument();
    expect(screen.getByText('75')).toBeInTheDocument();
    expect(screen.getByText('observadores')).toBeInTheDocument();
  });

  it('should render topics', async () => {
    vi.mocked(githubService.fetchRepositoryDetails).mockResolvedValue(mockRepoDetails);

    render(<RepositoryDetails />);

    await waitFor(() => {
      expect(screen.getByText('typescript')).toBeInTheDocument();
    });

    expect(screen.getByText('react')).toBeInTheDocument();
    expect(screen.getByText('testing')).toBeInTheDocument();
  });

  it('should render homepage link', async () => {
    vi.mocked(githubService.fetchRepositoryDetails).mockResolvedValue(mockRepoDetails);

    render(<RepositoryDetails />);

    await waitFor(() => {
      expect(screen.getByText('https://example.com')).toBeInTheDocument();
    });

    const link = screen.getByRole('link', { name: /visitar página do projeto/i });
    expect(link).toHaveAttribute('href', 'https://example.com');
  });

  it('should render external GitHub link', async () => {
    vi.mocked(githubService.fetchRepositoryDetails).mockResolvedValue(mockRepoDetails);

    render(<RepositoryDetails />);

    await waitFor(() => {
      expect(screen.getByRole('link', { name: /ver test-repo no github/i })).toBeInTheDocument();
    });
  });

  it('should navigate back on back button click', async () => {
    const user = userEvent.setup();
    vi.mocked(githubService.fetchRepositoryDetails).mockResolvedValue(mockRepoDetails);

    render(<RepositoryDetails />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'test-repo' })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /voltar/i }));

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it('should show error message on fetch failure', async () => {
    const apiError = { message: 'Repository not found', isGitHubAPIError: true };
    vi.mocked(githubService.fetchRepositoryDetails).mockRejectedValue(apiError);
    vi.mocked(githubService.isGitHubAPIError).mockReturnValue(true);

    render(<RepositoryDetails />);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Repository not found');
    });
  });

  it('should show cached data when fetch fails', async () => {
    vi.mocked(cacheService.getCachedRepoDetails).mockReturnValue(mockRepoDetails);
    vi.mocked(githubService.fetchRepositoryDetails).mockRejectedValue(new Error('Network error'));

    render(<RepositoryDetails />);

    await waitFor(() => {
      expect(screen.getByText('test-repo')).toBeInTheDocument();
    });

    expect(screen.getByText('Exibindo dados do cache (offline)')).toBeInTheDocument();
  });

  it('should cache fetched data', async () => {
    vi.mocked(githubService.fetchRepositoryDetails).mockResolvedValue(mockRepoDetails);

    render(<RepositoryDetails />);

    await waitFor(() => {
      expect(cacheService.cacheRepoDetails).toHaveBeenCalledWith(
        'testuser',
        'test-repo',
        mockRepoDetails
      );
    });
  });

  it('should format dates correctly', async () => {
    vi.mocked(githubService.fetchRepositoryDetails).mockResolvedValue(mockRepoDetails);

    render(<RepositoryDetails />);

    await waitFor(() => {
      expect(screen.getByText(/jan.*2023/i)).toBeInTheDocument();
    });
  });

  it('should not render topics section when empty', async () => {
    const repoWithoutTopics = { ...mockRepoDetails, topics: [] };
    vi.mocked(githubService.fetchRepositoryDetails).mockResolvedValue(repoWithoutTopics);

    render(<RepositoryDetails />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'test-repo' })).toBeInTheDocument();
    });

    expect(screen.queryByText('Tópicos')).not.toBeInTheDocument();
  });

  it('should not render homepage section when null', async () => {
    const repoWithoutHomepage = { ...mockRepoDetails, homepage: null };
    vi.mocked(githubService.fetchRepositoryDetails).mockResolvedValue(repoWithoutHomepage);

    render(<RepositoryDetails />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'test-repo' })).toBeInTheDocument();
    });

    expect(screen.queryByRole('link', { name: /visitar página do projeto/i })).not.toBeInTheDocument();
  });
});
