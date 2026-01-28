import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { UserInfoCard } from './UserInfoCard';
import type { GitHubUserDetails } from '@shared/types/github.types';

const mockUser: GitHubUserDetails = {
  login: 'testuser',
  avatar_url: 'https://example.com/avatar.png',
  name: 'Test User',
  bio: 'This is a test bio.',
  followers: 100,
  following: 50,
  public_repos: 25,
  location: 'Test Location',
  html_url: 'https://github.com/testuser',
};

const mockUserMinimal: GitHubUserDetails = {
  login: 'miniuser',
  avatar_url: 'https://example.com/avatar2.png',
  name: null,
  bio: null,
  followers: 1,
  following: 2,
  public_repos: 3,
  location: null,
  html_url: 'https://github.com/miniuser',
};

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('UserInfoCard', () => {
  it('should render user name', () => {
    renderWithRouter(<UserInfoCard user={mockUser} />);

    expect(screen.getByRole('heading', { name: 'Test User' })).toBeInTheDocument();
  });

  it('should render username link', () => {
    renderWithRouter(<UserInfoCard user={mockUser} />);

    expect(screen.getByText('@testuser')).toBeInTheDocument();
    const link = screen.getByRole('link', { name: /visitar perfil de testuser/i });
    expect(link).toHaveAttribute('href', 'https://github.com/testuser');
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('should render avatar', () => {
    renderWithRouter(<UserInfoCard user={mockUser} />);

    expect(screen.getByAltText('Foto de perfil de testuser')).toHaveAttribute('src', mockUser.avatar_url);
  });

  it('should render bio', () => {
    renderWithRouter(<UserInfoCard user={mockUser} />);

    expect(screen.getByText('This is a test bio.')).toBeInTheDocument();
  });

  it('should render follower count', () => {
    renderWithRouter(<UserInfoCard user={mockUser} />);

    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('should render following count', () => {
    renderWithRouter(<UserInfoCard user={mockUser} />);

    expect(screen.getByText('50')).toBeInTheDocument();
  });

  it('should render repository count', () => {
    renderWithRouter(<UserInfoCard user={mockUser} />);

    expect(screen.getByText('25')).toBeInTheDocument();
  });

  it('should render location', () => {
    renderWithRouter(<UserInfoCard user={mockUser} />);

    expect(screen.getByText('Test Location')).toBeInTheDocument();
  });

  it('should use login when name is null', () => {
    renderWithRouter(<UserInfoCard user={mockUserMinimal} />);

    expect(screen.getByRole('heading', { name: 'miniuser' })).toBeInTheDocument();
  });

  it('should not render bio when null', () => {
    renderWithRouter(<UserInfoCard user={mockUserMinimal} />);

    expect(screen.queryByText('This is a test bio.')).not.toBeInTheDocument();
  });

  it('should not render location when null', () => {
    renderWithRouter(<UserInfoCard user={mockUserMinimal} />);

    expect(screen.queryByText('Test Location')).not.toBeInTheDocument();
  });
});
