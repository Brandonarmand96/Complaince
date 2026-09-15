import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function NotFoundPage() {
  return (
    <div className="space-y-2">
      <h1 className="text-xl font-semibold">Page not found</h1>
      <p>This address does not match an available page.</p>
      <Button asChild variant="link" className="px-0">
        <Link to="/dashboard">Go to dashboard</Link>
      </Button>
    </div>
  );
}
