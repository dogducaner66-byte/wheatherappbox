import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import App from '../src/App';
import { clearPersistedAppStore } from '../src/store/appStore';

const renderApp = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>,
  );
};

describe('App shell', () => {
  beforeEach(() => {
    localStorage.clear();
    clearPersistedAppStore();
  });

  it('renders the premium shell with unit controls and saved cities section', () => {
    renderApp();

    expect(screen.getByRole('heading', { name: /a premium live forecast canvas with native-weather polish/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Metric' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Imperial' })).toBeInTheDocument();
    expect(screen.getByText(/saved cities/i)).toBeInTheDocument();
  });
});

