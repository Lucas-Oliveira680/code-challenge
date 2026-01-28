import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { UserCard } from './UserCard';
import type { GitHubUserSearchItem } from '@shared/types/github.types';

const mockUser: GitHubUserSearchItem = {
  id: 1,
  login: 'testuser',
  avatar_url: 'https://avatars.githubusercontent.com/testuser',
  html_url: 'https://github.com/testuser',
  type: 'User',
  score: 42.5,
};

describe('UserCard', () => {
  it('should render user login', () => {
    render(<UserCard user={mockUser} />);

    expect(screen.getByRole('heading', { name: 'testuser' })).toBeInTheDocument();
  });

  it('should render username with @ prefix', () => {
    render(<UserCard user={mockUser} />);

    expect(screen.getByText('@testuser')).toBeInTheDocument();
  });

  it('should render avatar image', () => {
    render(<UserCard user={mockUser} />);

    const avatar = screen.getByRole('img', { name: /avatar de testuser/i });
    expect(avatar).toHaveAttribute('src', mockUser.avatar_url);
  });

  it('should render user score', () => {
    render(<UserCard user={mockUser} />);

    expect(screen.getByText(/pontuação: 42.5/i)).toBeInTheDocument();
  });

  it('should render user type', () => {
    render(<UserCard user={mockUser} />);

    expect(screen.getByText('User')).toBeInTheDocument();
  });

  it('should call onClick when clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<UserCard user={mockUser} onClick={onClick} />);

    await user.click(screen.getByRole('article'));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should render as article element', () => {
    render(<UserCard user={mockUser} />);

    expect(screen.getByRole('article')).toBeInTheDocument();
  });

  it('should render Organization type correctly', () => {
    const orgUser = { ...mockUser, type: 'Organization' };
    render(<UserCard user={orgUser} />);

    expect(screen.getByText('Organization')).toBeInTheDocument();
  });
});
