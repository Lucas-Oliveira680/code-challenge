import { render, screen } from '../../../../test/test-utils';
import userEvent from '@testing-library/user-event';
import { RepositoryCard } from './RepositoryCard';
import type { GitHubRepository } from '@shared/types/github.types';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockRepository: GitHubRepository = {
  id: 1,
  name: 'test-repo',
  description: 'A test repository',
  stargazers_count: 42,
  html_url: 'https://github.com/testuser/test-repo',
  language: 'TypeScript',
  updated_at: '2024-01-01T00:00:00Z',
  owner: { login: 'testuser' },
};

describe('RepositoryCard', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('should render repository name', () => {
    render(<RepositoryCard repository={mockRepository} />);

    expect(screen.getByRole('heading', { name: 'test-repo' })).toBeInTheDocument();
  });

  it('should render star count', () => {
    render(<RepositoryCard repository={mockRepository} />);

    expect(screen.getByLabelText('42 estrelas')).toBeInTheDocument();
  });

  it('should render description when provided', () => {
    render(<RepositoryCard repository={mockRepository} />);

    expect(screen.getByText('A test repository')).toBeInTheDocument();
  });

  it('should not render description when null', () => {
    const repoWithoutDescription = { ...mockRepository, description: null };
    render(<RepositoryCard repository={repoWithoutDescription} />);

    expect(screen.queryByText('A test repository')).not.toBeInTheDocument();
  });

  it('should render language when provided', () => {
    render(<RepositoryCard repository={mockRepository} />);

    expect(screen.getByText('TypeScript')).toBeInTheDocument();
  });

  it('should not render language when null', () => {
    const repoWithoutLanguage = { ...mockRepository, language: null };
    render(<RepositoryCard repository={repoWithoutLanguage} />);

    expect(screen.queryByText('TypeScript')).not.toBeInTheDocument();
  });

  it('should navigate on click', async () => {
    const user = userEvent.setup();
    render(<RepositoryCard repository={mockRepository} />);

    const card = screen.getByRole('button');
    await user.click(card);

    expect(mockNavigate).toHaveBeenCalledWith('/repository?owner=testuser&repo=test-repo');
  });

  it('should navigate on Enter key press', async () => {
    const user = userEvent.setup();
    render(<RepositoryCard repository={mockRepository} />);

    const card = screen.getByRole('button');
    card.focus();
    await user.keyboard('{Enter}');

    expect(mockNavigate).toHaveBeenCalledWith('/repository?owner=testuser&repo=test-repo');
  });

  it('should navigate on Space key press', async () => {
    const user = userEvent.setup();
    render(<RepositoryCard repository={mockRepository} />);

    const card = screen.getByRole('button');
    card.focus();
    await user.keyboard(' ');

    expect(mockNavigate).toHaveBeenCalledWith('/repository?owner=testuser&repo=test-repo');
  });

  it('should have accessible label with star count', () => {
    render(<RepositoryCard repository={mockRepository} />);

    const card = screen.getByRole('button', { name: /ver detalhes de test-repo.*42 estrelas/i });
    expect(card).toBeInTheDocument();
  });

  it('should have accessible label without star count when zero', () => {
    const repoWithNoStars = { ...mockRepository, stargazers_count: 0 };
    render(<RepositoryCard repository={repoWithNoStars} />);

    const card = screen.getByRole('button', { name: /ver detalhes de test-repo/i });
    expect(card).toBeInTheDocument();
  });

  it('should be focusable', () => {
    render(<RepositoryCard repository={mockRepository} />);

    const card = screen.getByRole('button');
    expect(card).toHaveAttribute('tabIndex', '0');
  });
});
