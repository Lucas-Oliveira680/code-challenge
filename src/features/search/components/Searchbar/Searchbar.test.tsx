import { render, screen } from '../../../../test/test-utils';
import userEvent from '@testing-library/user-event';
import { SearchBar } from './Searchbar';

describe('SearchBar', () => {
  it('should render search input', () => {
    render(<SearchBar onSearch={vi.fn()} />);

    expect(screen.getByRole('searchbox')).toBeInTheDocument();
  });

  it('should render submit button', () => {
    render(<SearchBar onSearch={vi.fn()} />);

    expect(screen.getByRole('button', { name: /buscar/i })).toBeInTheDocument();
  });

  it('should update input value on change', async () => {
    const user = userEvent.setup();
    render(<SearchBar onSearch={vi.fn()} />);

    const input = screen.getByRole('searchbox');
    await user.type(input, 'test');

    expect(input).toHaveValue('test');
  });

  it('should call onSearch with trimmed query on valid submit', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);

    const input = screen.getByRole('searchbox');
    await user.type(input, '  testuser  ');
    await user.click(screen.getByRole('button', { name: /buscar/i }));

    expect(onSearch).toHaveBeenCalledWith('testuser');
  });

  it('should show error for empty query', async () => {
    const user = userEvent.setup();
    const onValidationError = vi.fn();
    render(<SearchBar onSearch={vi.fn()} onValidationError={onValidationError} />);

    const input = screen.getByRole('searchbox');
    await user.type(input, '   ');
    await user.click(screen.getByRole('button', { name: /buscar/i }));

    expect(screen.getByRole('alert')).toHaveTextContent(/obrigatória/i);
    expect(onValidationError).toHaveBeenCalled();
  });

  it('should show error for query with less than 2 characters', async () => {
    const user = userEvent.setup();
    render(<SearchBar onSearch={vi.fn()} />);

    const input = screen.getByRole('searchbox');
    await user.type(input, 'a');
    await user.click(screen.getByRole('button', { name: /buscar/i }));

    expect(screen.getByRole('alert')).toHaveTextContent(/pelo menos 2 caracteres/i);
  });

  it('should clear error when user types after error', async () => {
    const user = userEvent.setup();
    render(<SearchBar onSearch={vi.fn()} />);

    const input = screen.getByRole('searchbox');
    await user.type(input, 'a');
    await user.click(screen.getByRole('button', { name: /buscar/i }));

    expect(screen.getByRole('alert')).toBeInTheDocument();

    await user.type(input, 'bc');

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('should disable input and button when loading', () => {
    render(<SearchBar onSearch={vi.fn()} isLoading={true} />);

    expect(screen.getByRole('searchbox')).toBeDisabled();
    expect(screen.getByRole('button', { name: /buscar/i })).toBeDisabled();
  });

  it('should disable submit button when query is empty', () => {
    render(<SearchBar onSearch={vi.fn()} />);

    expect(screen.getByRole('button', { name: /buscar/i })).toBeDisabled();
  });

  it('should have correct accessibility attributes', () => {
    render(<SearchBar onSearch={vi.fn()} />);

    const input = screen.getByRole('searchbox');
    expect(input).toHaveAttribute('aria-label', 'Buscar usuários do GitHub');
    expect(input).toHaveAttribute('aria-invalid', 'false');
  });

  it('should set aria-invalid and aria-describedby when error', async () => {
    const user = userEvent.setup();
    render(<SearchBar onSearch={vi.fn()} />);

    const input = screen.getByRole('searchbox');
    await user.type(input, 'a');
    await user.click(screen.getByRole('button', { name: /buscar/i }));

    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', 'search-error');
  });

  it('should apply expanded class when isExpanded is true', () => {
    const { container } = render(<SearchBar onSearch={vi.fn()} isExpanded={true} />);

    expect(container.querySelector('.searchbar__container--expanded')).toBeInTheDocument();
  });

  it('should show spinner when loading', () => {
    const { container } = render(<SearchBar onSearch={vi.fn()} isLoading={true} />);

    expect(container.querySelector('.searchbar__spinner')).toBeInTheDocument();
  });

  it('should submit form on Enter key', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);

    const input = screen.getByRole('searchbox');
    await user.type(input, 'testuser{Enter}');

    expect(onSearch).toHaveBeenCalledWith('testuser');
  });
});
