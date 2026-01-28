import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { App } from './App';

vi.mock('./shared/components/OfflineBanner/OfflineBanner', () => ({
  OfflineBanner: () => <div data-testid="offline-banner">OfflineBanner</div>,
}));

vi.mock('./routes/AppRoutes', () => ({
  AppRoutes: () => <div data-testid="app-routes">AppRoutes</div>,
}));

describe('App', () => {
  it('should render skip link for accessibility', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );

    const skipLink = screen.getByRole('link', { name: /pular para o conteúdo principal/i });
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute('href', '#main-content');
  });

  it('should render OfflineBanner', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByTestId('offline-banner')).toBeInTheDocument();
  });

  it('should render AppRoutes', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByTestId('app-routes')).toBeInTheDocument();
  });

  it('should have skip link with skip-link class', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );

    const skipLink = screen.getByRole('link', { name: /pular para o conteúdo principal/i });
    expect(skipLink).toHaveClass('skip-link');
  });
});
