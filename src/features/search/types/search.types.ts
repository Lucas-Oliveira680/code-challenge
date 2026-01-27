import type { GitHubUserSearchItem, GitHubUserSearchResult } from '@shared/types/github.types';

export interface UserCardProps {
  user: GitHubUserSearchItem;
  onClick?: () => void;
}

export interface SearchbarProps {
  onSearch: (query: string) => void;
  onValidationError?: () => void;
  isLoading?: boolean;
  isExpanded?: boolean;
}

export interface UserSuggestionsProps {
  users: GitHubUserSearchItem[];
  onSelect: (username: string) => void;
  hasSearched: boolean;
  hasError?: boolean;
}

export interface RecentSearchesProps {
  users: GitHubUserSearchResult[];
  onSelect: (username: string) => void;
}
