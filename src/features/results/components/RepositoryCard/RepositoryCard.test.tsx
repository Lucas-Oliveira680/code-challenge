import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
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
  description: 'Test repository',
  stargazers_count: 100,
  html_url: 'https://github.com/testuser/test-repo',
  language: 'TypeScript',
  updated_at: '2024-01-01T00:00:00Z',
  owner: { login: 'testuser' },
};

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('RepositoryCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render repository name', () => {
    renderWithRouter(<RepositoryCard repository={mockRepository} />);

    expect(screen.getByRole('heading', { name: 'test-repo' })).toBeInTheDocument();
  });

  it('should render repository description', () => {
    renderWithRouter(<RepositoryCard repository={mockRepository} />);

    expect(screen.getByText('Test repository')).toBeInTheDocument();
  });

  it('should render star count', () => {
    renderWithRouter(<RepositoryCard repository={mockRepository} />);

    expect(screen.getByLabelText('100 estrelas')).toBeInTheDocument();
  });

  it('should render language', () => {
    renderWithRouter(<RepositoryCard repository={mockRepository} />);

    expect(screen.getByText('TypeScript')).toBeInTheDocument();
  });

  it('should have accessible heading', () => {
    renderWithRouter(<RepositoryCard repository={mockRepository} />);

    const heading = screen.getByRole('heading', { level: 3 });
    expect(heading).toBeInTheDocument();
  });

  it('should not render language if not provided', () => {
    const repoWithoutLanguage = { ...mockRepository, language: null };
    renderWithRouter(<RepositoryCard repository={repoWithoutLanguage} />);

    expect(screen.queryByText('TypeScript')).not.toBeInTheDocument();
  });

  it('should not render description if not provided', () => {
    const repoWithoutDescription = { ...mockRepository, description: null };
    renderWithRouter(<RepositoryCard repository={repoWithoutDescription} />);

    expect(screen.queryByText('Test repository')).not.toBeInTheDocument();
  });

  it('should navigate on click', async () => {
    const user = userEvent.setup();
    renderWithRouter(<RepositoryCard repository={mockRepository} />);

    const card = screen.getByRole('button');
    await user.click(card);

    expect(mockNavigate).toHaveBeenCalledWith('/repository?owner=testuser&repo=test-repo');
  });

  it('should navigate on Enter key press', async () => {
    const user = userEvent.setup();
    renderWithRouter(<RepositoryCard repository={mockRepository} />);

    const card = screen.getByRole('button');
    card.focus();
    await user.keyboard('{Enter}');

    expect(mockNavigate).toHaveBeenCalledWith('/repository?owner=testuser&repo=test-repo');
  });

  it('should navigate on Space key press', async () => {
    const user = userEvent.setup();
    renderWithRouter(<RepositoryCard repository={mockRepository} />);

    const card = screen.getByRole('button');
    card.focus();
    await user.keyboard(' ');

    expect(mockNavigate).toHaveBeenCalledWith('/repository?owner=testuser&repo=test-repo');
  });

  it('should have accessible label with star count', () => {
    renderWithRouter(<RepositoryCard repository={mockRepository} />);

    const card = screen.getByRole('button', { name: /ver detalhes de test-repo.*100 estrelas/i });
    expect(card).toBeInTheDocument();
  });

  it('should have accessible label without star count when zero', () => {
    const repoWithNoStars = { ...mockRepository, stargazers_count: 0 };
    renderWithRouter(<RepositoryCard repository={repoWithNoStars} />);

    const card = screen.getByRole('button', { name: 'Ver detalhes de test-repo' });
    expect(card).toBeInTheDocument();
  });

  it('should be focusable', () => {
    renderWithRouter(<RepositoryCard repository={mockRepository} />);

    const card = screen.getByRole('button');
    expect(card).toHaveAttribute('tabIndex', '0');
  });
});
