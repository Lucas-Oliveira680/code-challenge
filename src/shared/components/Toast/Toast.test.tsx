import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Toast } from './Toast';

describe('Toast', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render toast message', () => {
    render(<Toast message="Test message" onClose={vi.fn()} />);

    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(<Toast message="Test message" onClose={onClose} />);

    const closeButton = screen.getByRole('button');
    await user.click(closeButton);

    expect(onClose).toHaveBeenCalled();
  });

  it('should have proper accessibility attributes', () => {
    const { container } = render(<Toast message="Test message" onClose={vi.fn()} />);

    const toast = container.querySelector('[role="alert"]');
    expect(toast).toBeInTheDocument();
  });

  it('should auto-dismiss after timeout', () => {
    const onClose = vi.fn();
    vi.useFakeTimers();

    render(<Toast message="Test message" onClose={onClose} />);

    vi.advanceTimersByTime(5000);

    expect(onClose).toHaveBeenCalled();

    vi.useRealTimers();
  });
});
