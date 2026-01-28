import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RepositorySortControls } from './RepositorySortControls';

describe('RepositorySortControls', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render sort trigger button', () => {
    render(<RepositorySortControls onSortChange={vi.fn()} />);

    expect(screen.getByRole('button', { name: /ordenar repositórios/i })).toBeInTheDocument();
  });

  it('should open dropdown on button click', async () => {
    const user = userEvent.setup();
    render(<RepositorySortControls onSortChange={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /ordenar repositórios/i }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('A → Z')).toBeInTheDocument();
    expect(screen.getByText('Z → A')).toBeInTheDocument();
  });

  it('should close dropdown on Escape', async () => {
    const user = userEvent.setup();
    render(<RepositorySortControls onSortChange={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /ordenar repositórios/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should call onSortChange when Apply is clicked', async () => {
    const user = userEvent.setup();
    const onSortChange = vi.fn();
    render(<RepositorySortControls onSortChange={onSortChange} />);

    await user.click(screen.getByRole('button', { name: /ordenar repositórios/i }));
    await user.click(screen.getByRole('button', { name: 'A → Z' }));
    await user.click(screen.getByRole('button', { name: 'Aplicar' }));

    expect(onSortChange).toHaveBeenCalledWith('name-asc', null);
  });

  it('should call onSortChange with null when Clear is clicked', async () => {
    const user = userEvent.setup();
    const onSortChange = vi.fn();
    render(<RepositorySortControls onSortChange={onSortChange} />);

    await user.click(screen.getByRole('button', { name: /ordenar repositórios/i }));
    await user.click(screen.getByRole('button', { name: 'A → Z' }));
    await user.click(screen.getByRole('button', { name: 'Limpar' }));

    expect(onSortChange).toHaveBeenCalledWith(null, null);
  });

  it('should toggle sort option when clicked twice', async () => {
    const user = userEvent.setup();
    render(<RepositorySortControls onSortChange={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /ordenar repositórios/i }));

    const ascButton = screen.getByRole('button', { name: 'A → Z' });
    await user.click(ascButton);
    expect(ascButton).toHaveAttribute('aria-pressed', 'true');

    await user.click(ascButton);
    expect(ascButton).toHaveAttribute('aria-pressed', 'false');
  });

  it('should disable Apply when no changes', async () => {
    const user = userEvent.setup();
    render(<RepositorySortControls onSortChange={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /ordenar repositórios/i }));

    expect(screen.getByRole('button', { name: 'Aplicar' })).toBeDisabled();
  });

  it('should enable Apply when changes are made', async () => {
    const user = userEvent.setup();
    render(<RepositorySortControls onSortChange={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /ordenar repositórios/i }));
    await user.click(screen.getByRole('button', { name: 'A → Z' }));

    expect(screen.getByRole('button', { name: 'Aplicar' })).not.toBeDisabled();
  });

  it('should show active indicator when filters applied', async () => {
    const user = userEvent.setup();
    render(<RepositorySortControls onSortChange={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /ordenar repositórios/i }));
    await user.click(screen.getByRole('button', { name: 'A → Z' }));
    await user.click(screen.getByRole('button', { name: 'Aplicar' }));

    expect(screen.getByRole('button', { name: /filtros ativos/i })).toBeInTheDocument();
  });
});
