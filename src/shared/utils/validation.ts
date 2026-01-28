export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export const validateSearchQuery = (query: string): ValidationResult => {
  if (!query || query.trim().length === 0) {
    return { isValid: false, error: 'A busca é obrigatória' };
  }

  const trimmed = query.trim();

  if (trimmed.length < 2) {
    return { isValid: false, error: 'A busca deve ter pelo menos 2 caracteres' };
  }

  if (trimmed.length > 256) {
    return { isValid: false, error: 'A busca é muito longa' };
  }

  return { isValid: true };
};
