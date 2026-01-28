import { render, screen } from '@testing-library/react';
import { OfflineBanner } from './OfflineBanner';
import * as useOnlineStatusModule from '../../hooks/useOnlineStatus';

vi.mock('../../hooks/useOnlineStatus');

describe('OfflineBanner', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should not render when online', () => {
    vi.mocked(useOnlineStatusModule.useOnlineStatus).mockReturnValue(true);

    const { container } = render(<OfflineBanner />);

    expect(container).toBeEmptyDOMElement();
  });

  it('should render when offline', () => {
    vi.mocked(useOnlineStatusModule.useOnlineStatus).mockReturnValue(false);

    render(<OfflineBanner />);

    expect(screen.getByText(/conexão perdida/i)).toBeInTheDocument();
  });

  it('should have correct accessibility attributes', () => {
    vi.mocked(useOnlineStatusModule.useOnlineStatus).mockReturnValue(false);

    render(<OfflineBanner />);

    const banner = screen.getByRole('status');
    expect(banner).toHaveAttribute('aria-live', 'polite');
    expect(banner).toHaveAttribute('aria-label', 'Aviso de conexão');
  });

  it('should display offline message', () => {
    vi.mocked(useOnlineStatusModule.useOnlineStatus).mockReturnValue(false);

    render(<OfflineBanner />);

    expect(screen.getByText(/buscando no cache offline/i)).toBeInTheDocument();
  });
});
