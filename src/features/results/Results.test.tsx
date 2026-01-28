import { render, screen } from '../../test/test-utils';
import userEvent from '@testing-library/user-event';
import { Results } from './Results';
import * as useGitHubSearchModule from '@shared/hooks/useGitHubSearch';
import type { GitHubUserSearchResult } from '@shared/types/github.types';

const mockNavigate = vi.fn();
let mockSearchParams = new URLSearchParams('username=testuser');

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [mockSearchParams],
  };
});

vi.mock('@shared/hooks/useGitHubSearch');
vi.mock('@shared/services/github.service');
vi.mock('@shared/services/cache.service');

const mockUserData: GitHubUserSearchResult = {
  user: {
    login: 'testuser',
    name: 'Test User',
    avatar_url: 'https://avatars.githubusercontent.com/testuser',
    bio: 'Test bio',
    location: 'Test Location',
    followers: 100,
    following: 50,
    public_repos: 5,
    html_url: 'https://github.com/testuser',
  },
  repositories: [
    {
      id: 1,
      name: 'repo1',
      description: 'Test repo 1',
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
  ],
  totalStars: 30,
  fetchedAt: Date.now(),
  username: 'testuser',
  hasMoreRepos: false,
};

describe('Results', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockSearchParams = new URLSearchParams('username=testuser');
  });

  it('should show loading state initially', () => {
    vi.mocked(useGitHubSearchModule.useGitHubSearch).mockReturnValue({
      loading: true,
      error: null,
      data: null,
      search: vi.fn(),
      reset: vi.fn(),
    });

    render(<Results />);

    expect(screen.getByText('Carregando...')).toBeInTheDocument();
    expect(screen.getByRole('main')).toHaveAttribute('aria-busy', 'true');
  });

  it('should show error state', () => {
    vi.mocked(useGitHubSearchModule.useGitHubSearch).mockReturnValue({
      loading: false,
      error: 'User not found',
      data: null,
      search: vi.fn(),
      reset: vi.fn(),
    });

    render(<Results />);

    expect(screen.getByRole('alert')).toHaveTextContent('User not found');
    expect(screen.getByRole('button', { name: /voltar/i })).toBeInTheDocument();
  });

  it('should navigate to home on error button click', async () => {
    const user = userEvent.setup();
    vi.mocked(useGitHubSearchModule.useGitHubSearch).mockReturnValue({
      loading: false,
      error: 'User not found',
      data: null,
      search: vi.fn(),
      reset: vi.fn(),
    });

    render(<Results />);

    await user.click(screen.getByRole('button', { name: /voltar/i }));

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('should redirect to home if no username in params', () => {
    mockSearchParams = new URLSearchParams();
    vi.mocked(useGitHubSearchModule.useGitHubSearch).mockReturnValue({
      loading: false,
      error: null,
      data: null,
      search: vi.fn(),
      reset: vi.fn(),
    });

    render(<Results />);

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('should render user data when loaded', () => {
    vi.mocked(useGitHubSearchModule.useGitHubSearch).mockReturnValue({
      loading: false,
      error: null,
      data: mockUserData,
      search: vi.fn(),
      reset: vi.fn(),
    });

    render(<Results />);

    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('repo1')).toBeInTheDocument();
    expect(screen.getByText('repo2')).toBeInTheDocument();
  });

  it('should show repository count in title', () => {
    vi.mocked(useGitHubSearchModule.useGitHubSearch).mockReturnValue({
      loading: false,
      error: null,
      data: mockUserData,
      search: vi.fn(),
      reset: vi.fn(),
    });

    render(<Results />);

    expect(screen.getByText('Repositórios (5)')).toBeInTheDocument();
  });

  it('should navigate home on back button click', async () => {
    const user = userEvent.setup();
    vi.mocked(useGitHubSearchModule.useGitHubSearch).mockReturnValue({
      loading: false,
      error: null,
      data: mockUserData,
      search: vi.fn(),
      reset: vi.fn(),
    });

    render(<Results />);

    await user.click(screen.getByRole('button', { name: /voltar para busca/i }));

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('should have accessible page title', () => {
    vi.mocked(useGitHubSearchModule.useGitHubSearch).mockReturnValue({
      loading: false,
      error: null,
      data: mockUserData,
      search: vi.fn(),
      reset: vi.fn(),
    });

    render(<Results />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Perfil de testuser no GitHub');
  });

  it('should call search on mount', () => {
    const searchMock = vi.fn();
    vi.mocked(useGitHubSearchModule.useGitHubSearch).mockReturnValue({
      loading: false,
      error: null,
      data: null,
      search: searchMock,
      reset: vi.fn(),
    });

    render(<Results />);

    expect(searchMock).toHaveBeenCalledWith('testuser');
  });

  it('should not call search if already has data for user', () => {
    const searchMock = vi.fn();
    vi.mocked(useGitHubSearchModule.useGitHubSearch).mockReturnValue({
      loading: false,
      error: null,
      data: mockUserData,
      search: searchMock,
      reset: vi.fn(),
    });

    render(<Results />);

    expect(searchMock).not.toHaveBeenCalled();
  });

  it('should render sort controls', () => {
    vi.mocked(useGitHubSearchModule.useGitHubSearch).mockReturnValue({
      loading: false,
      error: null,
      data: mockUserData,
      search: vi.fn(),
      reset: vi.fn(),
    });

    render(<Results />);

    expect(screen.getByRole('button', { name: /ordenar repositórios/i })).toBeInTheDocument();
  });
});
