export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export const validateSearchQuery = (query: string): ValidationResult => {
  if (!query || query.trim().length === 0) {
    return { isValid: false, error: 'Search query is required' };
  }

  const trimmed = query.trim();

  if (trimmed.length < 2) {
    return { isValid: false, error: 'Search query must be at least 2 characters' };
  }

  if (trimmed.length > 256) {
    return { isValid: false, error: 'Search query is too long' };
  }

  return { isValid: true };
};
