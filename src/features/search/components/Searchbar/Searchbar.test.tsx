import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validateSearchQuery } from '@shared/utils/validation';
import { SearchBar } from './Searchbar';

// Mock the external validation utility
vi.mock('@shared/utils/validation', () => ({
  validateSearchQuery: vi.fn(),
}));

describe('SearchBar Component', () => {
  const mockOnSearch = vi.fn();
  const mockOnValidationError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with default state', () => {
    render(<SearchBar onSearch={mockOnSearch} />);
    
    expect(screen.getByRole('searchbox')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Buscar usuários do GitHub/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /buscar/i })).toBeDisabled();
  });

  it('updates input value on change', async () => {
    const user = userEvent.setup();
    render(<SearchBar onSearch={mockOnSearch} />);
    
    const input = screen.getByRole('searchbox');
    await user.type(input, 'lucas');
    
    expect(input).toHaveValue('lucas');
    expect(screen.getByRole('button', { name: /buscar/i })).toBeEnabled();
  });

  it('calls onSearch with trimmed query when validation passes', async () => {
    const user = userEvent.setup();
    (validateSearchQuery as any).mockReturnValue({ isValid: true });
    
    render(<SearchBar onSearch={mockOnSearch} />);
    
    const input = screen.getByRole('searchbox');
    const button = screen.getByRole('button', { name: /buscar/i });
    
    await user.type(input, '  react dev  ');
    await user.click(button);

    expect(validateSearchQuery).toHaveBeenCalledWith('  react dev  ');
    expect(mockOnSearch).toHaveBeenCalledWith('react dev');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows error message and calls onValidationError when validation fails', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Nome muito curto';
    (validateSearchQuery as any).mockReturnValue({ 
      isValid: false, 
      error: errorMessage 
    });

    render(<SearchBar onSearch={mockOnSearch} onValidationError={mockOnValidationError} />);
    
    const input = screen.getByRole('searchbox');
    await user.type(input, 'a');
    await user.click(screen.getByRole('button', { name: /buscar/i }));

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent(errorMessage);
    expect(mockOnValidationError).toHaveBeenCalled();
    expect(mockOnSearch).not.toHaveBeenCalled();
  });

  it('clears error when user starts typing again', async () => {
    const user = userEvent.setup();
    (validateSearchQuery as any).mockReturnValue({ isValid: false, error: 'Error' });

    render(<SearchBar onSearch={mockOnSearch} />);
    
    const input = screen.getByRole('searchbox');
    await user.type(input, 'a');
    await user.click(screen.getByRole('button', { name: /buscar/i }));
    
    expect(screen.getByRole('alert')).toBeInTheDocument();

    await user.type(input, 'b');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('disables input and shows loading state when isLoading is true', () => {
    render(<SearchBar onSearch={mockOnSearch} isLoading={true} />);
    
    expect(screen.getByRole('searchbox')).toBeDisabled();
    expect(screen.getByRole('button', { name: /buscar/i })).toBeDisabled();
    expect(document.querySelector('.searchbar__spinner')).toBeInTheDocument();
  });

  it('applies expanded class when isExpanded prop is true', () => {
    const { container } = render(<SearchBar onSearch={mockOnSearch} isExpanded={true} />);
    const wrapper = container.querySelector('.searchbar__container');
    expect(wrapper).toHaveClass('searchbar__container--expanded');
  });
});