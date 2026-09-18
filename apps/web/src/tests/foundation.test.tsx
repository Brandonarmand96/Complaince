import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { SetupPanel } from '@/components/setup/SetupPanel';
import { useUiStore } from '@/lib/ui-store';
describe('local foundation', () => {
  it('turns a server validation response into a typed field error', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ error: { code: 'VALIDATION_ERROR', message: 'Invalid label', fields: { label: ['Label already used.'] } }, requestId: 'req-1' }), { status: 400 }));
    await expect(apiFetch('/example')).rejects.toMatchObject({ status: 400, code: 'VALIDATION_ERROR', fields: { label: ['Label already used.'] }, requestId: 'req-1' });
  });
  it('shows client errors, server errors and an actual health retry', async () => {
    let available = false;
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(async (url, options) => {
      if (String(url).endsWith('/health/ready')) return new Response(JSON.stringify({ status: available ? 'ok' : 'unavailable' }), { status: available ? 200 : 503 });
      if (options?.method === 'POST') return new Response(JSON.stringify({ error: { code: 'VALIDATION_ERROR', message: 'Check the highlighted fields.', fields: { label: ['Choose another label.'] } }, requestId: 'req' }), { status: 400 });
      return new Response(JSON.stringify({ data: [], page: 1, limit: 5, total: 0 }));
    });
    const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
    render(<QueryClientProvider client={client}><SetupPanel /></QueryClientProvider>);
    await screen.findByText(/A required service is unavailable/);
    fireEvent.click(screen.getByRole('button', { name: 'Send sample job' }));
    await screen.findByText('Enter at least 2 characters.');
    expect(fetchMock.mock.calls.some(([, options]) => options?.method === 'POST')).toBe(false);
    fireEvent.change(screen.getByLabelText('Sample job label'), { target: { value: 'Server check' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send sample job' }));
    await screen.findByText('Choose another label.');
    expect(screen.getByLabelText('Sample job label')).toHaveAttribute('aria-invalid', 'true');
    available = true;
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    await waitFor(() => expect(screen.getByText('PostgreSQL and Redis are connected.')).toBeVisible());
    client.clear();
  });
  it('toggles sidebar preferences without storing server data', () => {
    useUiStore.setState({ collapsedSections: new Set() });
    useUiStore.getState().toggleSection('Compliance');
    expect(useUiStore.getState().collapsedSections.has('Compliance')).toBe(true);
    useUiStore.getState().toggleSection('Compliance');
    expect(useUiStore.getState().collapsedSections.has('Compliance')).toBe(false);
  });
});

