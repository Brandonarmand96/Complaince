import { Component, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return <p role="status" className="py-2 text-sm text-muted-foreground">{label}</p>;
}
export function ErrorState({ message, retry, pending = false }: { message: string; retry: () => void; pending?: boolean }) {
  return <div className="space-y-3 py-2"><p role="alert" className="text-sm">{message}</p><Button variant="outline" onClick={retry} disabled={pending}>{pending ? 'Retrying…' : 'Try again'}</Button></div>;
}
export class AppErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (this.state.failed) return <main className="mx-auto max-w-xl p-8"><h1 className="text-xl font-semibold">This view could not load</h1><ErrorState message="Please retry to reopen the view." retry={() => this.setState({ failed: false })} /></main>;
    return this.props.children;
  }
}

