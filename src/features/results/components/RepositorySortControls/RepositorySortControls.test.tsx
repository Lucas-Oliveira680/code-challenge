import { render, screen } from '../../../../test/test-utils';
import userEvent from '@testing-library/user-event';
import { RepositorySortControls } from './RepositorySortControls';

describe('RepositorySortControls', () => {
  it('should render sort button', () => {
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
    expect(screen.getByText('Menor → Maior')).toBeInTheDocument();
    expect(screen.getByText('Maior → Menor')).toBeInTheDocument();
  });

  it('should close dropdown on Escape key', async () => {
    const user = userEvent.setup();
    render(<RepositorySortControls onSortChange={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /ordenar repositórios/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should toggle name sort options', async () => {
    const user = userEvent.setup();
    render(<RepositorySortControls onSortChange={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /ordenar repositórios/i }));

    const ascButton = screen.getByRole('button', { name: 'A → Z' });
    await user.click(ascButton);
    expect(ascButton).toHaveAttribute('aria-pressed', 'true');

    await user.click(ascButton);
    expect(ascButton).toHaveAttribute('aria-pressed', 'false');
  });

  it('should toggle stars sort options', async () => {
    const user = userEvent.setup();
    render(<RepositorySortControls onSortChange={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /ordenar repositórios/i }));

    const descButton = screen.getByRole('button', { name: 'Maior → Menor' });
    await user.click(descButton);
    expect(descButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('should call onSortChange when Apply is clicked', async () => {
    const user = userEvent.setup();
    const onSortChange = vi.fn();
    render(<RepositorySortControls onSortChange={onSortChange} />);

    await user.click(screen.getByRole('button', { name: /ordenar repositórios/i }));
    await user.click(screen.getByRole('button', { name: 'A → Z' }));
    await user.click(screen.getByRole('button', { name: 'Maior → Menor' }));
    await user.click(screen.getByRole('button', { name: 'Aplicar' }));

    expect(onSortChange).toHaveBeenCalledWith('name-asc', 'stars-desc');
  });

  it('should clear all selections when Clear is clicked', async () => {
    const user = userEvent.setup();
    const onSortChange = vi.fn();
    render(<RepositorySortControls onSortChange={onSortChange} />);

    await user.click(screen.getByRole('button', { name: /ordenar repositórios/i }));
    await user.click(screen.getByRole('button', { name: 'A → Z' }));
    await user.click(screen.getByRole('button', { name: 'Limpar' }));

    expect(onSortChange).toHaveBeenCalledWith(null, null);
  });

  it('should disable Apply button when no changes', async () => {
    const user = userEvent.setup();
    render(<RepositorySortControls onSortChange={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /ordenar repositórios/i }));

    expect(screen.getByRole('button', { name: 'Aplicar' })).toBeDisabled();
  });

  it('should enable Apply button when there are changes', async () => {
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

    expect(
      screen.getByRole('button', { name: /ordenar repositórios.*filtros ativos/i })
    ).toBeInTheDocument();
  });

  it('should close dropdown and focus trigger on Apply', async () => {
    const user = userEvent.setup();
    render(<RepositorySortControls onSortChange={vi.fn()} />);

    const trigger = screen.getByRole('button', { name: /ordenar repositórios/i });
    await user.click(trigger);
    await user.click(screen.getByRole('button', { name: 'A → Z' }));
    await user.click(screen.getByRole('button', { name: 'Aplicar' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('should have correct aria-expanded attribute', async () => {
    const user = userEvent.setup();
    render(<RepositorySortControls onSortChange={vi.fn()} />);

    const trigger = screen.getByRole('button', { name: /ordenar repositórios/i });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });
});
