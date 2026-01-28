import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toast } from './Toast';

describe('Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render the message', () => {
    render(<Toast message="Test message" onClose={vi.fn()} />);

    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('should have correct accessibility attributes', () => {
    render(<Toast message="Test message" onClose={vi.fn()} />);

    const toast = screen.getByRole('alert');
    expect(toast).toHaveAttribute('aria-live', 'assertive');
    expect(toast).toHaveAttribute('aria-atomic', 'true');
  });

  it('should call onClose when close button is clicked', async () => {
    vi.useRealTimers();
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(<Toast message="Test message" onClose={onClose} />);

    const closeButton = screen.getByRole('button', { name: /fechar/i });
    await user.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should auto-close after default duration (5000ms)', () => {
    const onClose = vi.fn();

    render(<Toast message="Test message" onClose={onClose} />);

    expect(onClose).not.toHaveBeenCalled();

    vi.advanceTimersByTime(5000);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should auto-close after custom duration', () => {
    const onClose = vi.fn();

    render(<Toast message="Test message" onClose={onClose} duration={3000} />);

    vi.advanceTimersByTime(2999);
    expect(onClose).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should focus the close button on mount', () => {
    vi.useRealTimers();
    render(<Toast message="Test message" onClose={vi.fn()} />);

    const closeButton = screen.getByRole('button', { name: /fechar/i });
    expect(closeButton).toHaveFocus();
  });

  it('should clean up timer on unmount', () => {
    const onClose = vi.fn();

    const { unmount } = render(<Toast message="Test message" onClose={onClose} />);

    unmount();

    vi.advanceTimersByTime(5000);

    expect(onClose).not.toHaveBeenCalled();
  });
});
