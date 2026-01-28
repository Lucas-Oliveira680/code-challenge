import { render, screen } from '../../../../test/test-utils';
import { UserInfoCard } from './UserInfoCard';
import type { GitHubUserDetails } from '@shared/types/github.types';

const mockUser: GitHubUserDetails = {
  login: 'testuser',
  name: 'Test User',
  avatar_url: 'https://avatars.githubusercontent.com/testuser',
  bio: 'Test bio description',
  location: 'São Paulo, Brazil',
  followers: 100,
  following: 50,
  public_repos: 25,
  html_url: 'https://github.com/testuser',
};

describe('UserInfoCard', () => {
  it('should render user name', () => {
    render(<UserInfoCard user={mockUser} />);

    expect(screen.getByRole('heading', { name: 'Test User' })).toBeInTheDocument();
  });

  it('should render login when name is null', () => {
    const userWithoutName = { ...mockUser, name: null };
    render(<UserInfoCard user={userWithoutName} />);

    expect(screen.getByRole('heading', { name: 'testuser' })).toBeInTheDocument();
  });

  it('should render username link', () => {
    render(<UserInfoCard user={mockUser} />);

    const link = screen.getByRole('link', { name: /visitar perfil/i });
    expect(link).toHaveAttribute('href', 'https://github.com/testuser');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('should render avatar image', () => {
    render(<UserInfoCard user={mockUser} />);

    const avatar = screen.getByRole('img', { name: /foto de perfil/i });
    expect(avatar).toHaveAttribute('src', mockUser.avatar_url);
  });

  it('should render bio when provided', () => {
    render(<UserInfoCard user={mockUser} />);

    expect(screen.getByText('Test bio description')).toBeInTheDocument();
  });

  it('should not render bio when null', () => {
    const userWithoutBio = { ...mockUser, bio: null };
    render(<UserInfoCard user={userWithoutBio} />);

    expect(screen.queryByText('Test bio description')).not.toBeInTheDocument();
  });

  it('should render follower count', () => {
    render(<UserInfoCard user={mockUser} />);

    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText(/seguidores/i)).toBeInTheDocument();
  });

  it('should render following count', () => {
    render(<UserInfoCard user={mockUser} />);

    expect(screen.getByText('50')).toBeInTheDocument();
    expect(screen.getByText(/seguindo/i)).toBeInTheDocument();
  });

  it('should render repository count', () => {
    render(<UserInfoCard user={mockUser} />);

    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText(/repositórios/i)).toBeInTheDocument();
  });

  it('should render location when provided', () => {
    render(<UserInfoCard user={mockUser} />);

    expect(screen.getByText('São Paulo, Brazil')).toBeInTheDocument();
  });

  it('should not render location when null', () => {
    const userWithoutLocation = { ...mockUser, location: null };
    render(<UserInfoCard user={userWithoutLocation} />);

    expect(screen.queryByText('São Paulo, Brazil')).not.toBeInTheDocument();
  });

  it('should have accessible article label', () => {
    render(<UserInfoCard user={mockUser} />);

    const article = screen.getByRole('article', { name: /informações de test user/i });
    expect(article).toBeInTheDocument();
  });
});
