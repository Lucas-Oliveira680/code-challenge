import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { RecentSearches } from './RecentSearches';
import type { GitHubUserSearchResult } from '@shared/types/github.types';

const mockUsers: GitHubUserSearchResult[] = [
  {
    user: {
      login: 'user1',
      name: 'User One',
      avatar_url: 'https://avatars.githubusercontent.com/user1',
      bio: 'Bio 1',
      location: 'Location 1',
      followers: 100,
      following: 50,
      public_repos: 25,
      html_url: 'https://github.com/user1',
    },
    repositories: [],
    totalStars: 0,
    fetchedAt: Date.now(),
    username: 'user1',
    hasMoreRepos: false,
  },
  {
    user: {
      login: 'user2',
      name: null,
      avatar_url: 'https://avatars.githubusercontent.com/user2',
      bio: null,
      location: null,
      followers: 200,
      following: 100,
      public_repos: 50,
      html_url: 'https://github.com/user2',
    },
    repositories: [],
    totalStars: 0,
    fetchedAt: Date.now(),
    username: 'user2',
    hasMoreRepos: false,
  },
];

describe('RecentSearches', () => {
  it('should not render when no users', () => {
    const { container } = render(<RecentSearches users={[]} onSelect={vi.fn()} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('should render section with title', () => {
    render(<RecentSearches users={mockUsers} onSelect={vi.fn()} />);

    expect(screen.getByRole('heading', { name: 'Buscas Recentes' })).toBeInTheDocument();
  });

  it('should render list of recent users', () => {
    render(<RecentSearches users={mockUsers} onSelect={vi.fn()} />);

    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  it('should render user login names', () => {
    render(<RecentSearches users={mockUsers} onSelect={vi.fn()} />);

    expect(screen.getByText('user1')).toBeInTheDocument();
    expect(screen.getByText('user2')).toBeInTheDocument();
  });

  it('should render user full name when available', () => {
    render(<RecentSearches users={mockUsers} onSelect={vi.fn()} />);

    expect(screen.getByText('User One')).toBeInTheDocument();
  });

  it('should not render full name when null', () => {
    render(<RecentSearches users={mockUsers} onSelect={vi.fn()} />);

    const user2Card = screen.getByRole('button', { name: /ver perfil de user2/i });
    expect(user2Card).not.toHaveTextContent('User Two');
  });

  it('should call onSelect with username when user is clicked', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<RecentSearches users={mockUsers} onSelect={onSelect} />);

    await user.click(screen.getByRole('button', { name: /ver perfil de user1/i }));

    expect(onSelect).toHaveBeenCalledWith('user1');
  });

  it('should have accessible labels on buttons', () => {
    render(<RecentSearches users={mockUsers} onSelect={vi.fn()} />);

    expect(screen.getByRole('button', { name: /ver perfil de user1.*user one/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ver perfil de user2/i })).toBeInTheDocument();
  });

  it('should have section with aria-labelledby', () => {
    render(<RecentSearches users={mockUsers} onSelect={vi.fn()} />);

    const section = screen.getByRole('region', { name: /buscas recentes/i });
    expect(section).toBeInTheDocument();
  });

  it('should render avatars with aria-hidden', () => {
    const { container } = render(<RecentSearches users={mockUsers} onSelect={vi.fn()} />);

    const avatars = container.querySelectorAll('img');
    expect(avatars).toHaveLength(2);
    avatars.forEach((avatar) => {
      expect(avatar).toHaveAttribute('aria-hidden', 'true');
    });
  });
});
