import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { UserSuggestions } from './UserSuggestions';
import type { GitHubUserSearchItem } from '@shared/types/github.types';

const mockUsers: GitHubUserSearchItem[] = [
  {
    id: 1,
    login: 'user1',
    avatar_url: 'https://avatars.githubusercontent.com/user1',
    html_url: 'https://github.com/user1',
    type: 'User',
    score: 10,
  },
  {
    id: 2,
    login: 'user2',
    avatar_url: 'https://avatars.githubusercontent.com/user2',
    html_url: 'https://github.com/user2',
    type: 'User',
    score: 20,
  },
];

describe('UserSuggestions', () => {
  it('should not render when hasSearched is false', () => {
    const { container } = render(
      <UserSuggestions users={mockUsers} onSelect={vi.fn()} hasSearched={false} />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('should not render when hasError is true', () => {
    const { container } = render(
      <UserSuggestions users={mockUsers} onSelect={vi.fn()} hasSearched={true} hasError={true} />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('should show empty message when no users found', () => {
    render(<UserSuggestions users={[]} onSelect={vi.fn()} hasSearched={true} />);

    expect(screen.getByText('Nenhum usuário encontrado')).toBeInTheDocument();
  });

  it('should render user list when users exist', () => {
    render(<UserSuggestions users={mockUsers} onSelect={vi.fn()} hasSearched={true} />);

    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getAllByRole('option')).toHaveLength(2);
  });

  it('should render user avatars and names', () => {
    render(<UserSuggestions users={mockUsers} onSelect={vi.fn()} hasSearched={true} />);

    expect(screen.getByText('user1')).toBeInTheDocument();
    expect(screen.getByText('user2')).toBeInTheDocument();
  });

  it('should call onSelect with username when user is clicked', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<UserSuggestions users={mockUsers} onSelect={onSelect} hasSearched={true} />);

    await user.click(screen.getByRole('button', { name: /ver perfil de user1/i }));

    expect(onSelect).toHaveBeenCalledWith('user1');
  });

  it('should have accessible labels on buttons', () => {
    render(<UserSuggestions users={mockUsers} onSelect={vi.fn()} hasSearched={true} />);

    expect(screen.getByRole('button', { name: /ver perfil de user1/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ver perfil de user2/i })).toBeInTheDocument();
  });

  it('should have navigation landmark', () => {
    render(<UserSuggestions users={mockUsers} onSelect={vi.fn()} hasSearched={true} />);

    expect(screen.getByRole('navigation', { name: /sugestões de usuários/i })).toBeInTheDocument();
  });

  it('should render avatars with aria-hidden', () => {
    const { container } = render(<UserSuggestions users={mockUsers} onSelect={vi.fn()} hasSearched={true} />);

    const avatars = container.querySelectorAll('img');
    expect(avatars).toHaveLength(2);
    avatars.forEach((avatar) => {
      expect(avatar).toHaveAttribute('aria-hidden', 'true');
    });
  });
});
