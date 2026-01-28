import { validateSearchQuery } from './validation';

describe('validateSearchQuery', () => {
  it('should return invalid for empty string', () => {
    const result = validateSearchQuery('');

    expect(result.isValid).toBe(false);
    expect(result.error).toBe('A busca é obrigatória');
  });

  it('should return invalid for whitespace only', () => {
    const result = validateSearchQuery('   ');

    expect(result.isValid).toBe(false);
    expect(result.error).toBe('A busca é obrigatória');
  });

  it('should return invalid for single character', () => {
    const result = validateSearchQuery('a');

    expect(result.isValid).toBe(false);
    expect(result.error).toBe('A busca deve ter pelo menos 2 caracteres');
  });

  it('should return invalid for single character with whitespace', () => {
    const result = validateSearchQuery('  a  ');

    expect(result.isValid).toBe(false);
    expect(result.error).toBe('A busca deve ter pelo menos 2 caracteres');
  });

  it('should return valid for 2 characters', () => {
    const result = validateSearchQuery('ab');

    expect(result.isValid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should return valid for normal query', () => {
    const result = validateSearchQuery('testuser');

    expect(result.isValid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should return valid for query with spaces (trimmed)', () => {
    const result = validateSearchQuery('  test user  ');

    expect(result.isValid).toBe(true);
  });

  it('should return invalid for query longer than 256 characters', () => {
    const longQuery = 'a'.repeat(257);
    const result = validateSearchQuery(longQuery);

    expect(result.isValid).toBe(false);
    expect(result.error).toBe('A busca é muito longa');
  });

  it('should return valid for query with exactly 256 characters', () => {
    const maxQuery = 'a'.repeat(256);
    const result = validateSearchQuery(maxQuery);

    expect(result.isValid).toBe(true);
  });
});
