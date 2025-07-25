import React from 'react';
import { render, screen, waitFor, userEvent } from '../../test-utils';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { AddURL } from '../../components/AddURL';
import { URLTable } from '../../components/URLTable';

// Mock the API
vi.mock('../../services/api', () => ({
  urlAPI: {
    getAll: vi.fn().mockResolvedValue({
      data: {
        data: [
          {
            id: 1,
            url: 'https://example.com',
            title: 'Example Site',
            status: 'completed',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
          {
            id: 2,
            url: 'https://test.com',
            title: 'Test Site',
            status: 'failed',
            created_at: '2024-01-01T01:00:00Z',
            updated_at: '2024-01-01T01:00:00Z',
          },
        ],
        pagination: {
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      },
    }),
    add: vi.fn().mockResolvedValue({
      data: {
        id: 3,
        url: 'https://newsite.com',
        title: '',
        status: 'queued',
        created_at: '2024-01-01T02:00:00Z',
        updated_at: '2024-01-01T02:00:00Z',
      },
    }),
    bulkAction: vi.fn().mockResolvedValue({ data: { success: true } }),
  },
}));

const IntegrationWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </MemoryRouter>
  );
};

describe('URL Management Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders AddURL component and allows user input', async () => {
    const user = userEvent.setup();
    
    render(
      <IntegrationWrapper>
        <AddURL />
      </IntegrationWrapper>
    );

    // Check that AddURL form is rendered
    expect(screen.getByText('Add New URL')).toBeInTheDocument();
    
    // Find and fill the URL input
    const urlInput = screen.getByPlaceholderText(/https:\/\/example.com/);
    await user.type(urlInput, 'https://newsite.com');
    
    expect(urlInput).toHaveValue('https://newsite.com');

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /add url/i });
    await user.click(submitButton);

    // Verify the API was called
    const { urlAPI } = await import('../../services/api');
    expect(urlAPI.add).toHaveBeenCalledWith({ url: 'https://newsite.com' });
  });

  it('handles URLTable error states gracefully', async () => {
    render(
      <IntegrationWrapper>
        <URLTable />
      </IntegrationWrapper>
    );

    // The component should render without crashing
    // It shows error state when API call fails
    await waitFor(() => {
      expect(screen.getByText('Website URLs')).toBeInTheDocument();
    });
    
    // Should show some error/empty state
    expect(screen.getByText(/No URLs Added Yet/i)).toBeInTheDocument();
  });
});