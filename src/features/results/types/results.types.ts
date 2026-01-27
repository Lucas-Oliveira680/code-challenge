import type { GitHubRepository, GitHubUserDetails } from '@shared/types/github.types';

export type SortOption = 'name-asc' | 'name-desc' | 'stars-asc' | 'stars-desc' | null;

export interface RepositoryCardProps {
  repository: GitHubRepository;
}

export interface UserInfoCardProps {
  user: GitHubUserDetails;
  totalStars?: number;
}

export interface RepositorySortControlsProps {
  onSortChange: (nameSort: SortOption, starsSort: SortOption) => void;
}
