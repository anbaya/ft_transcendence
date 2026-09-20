import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
        <ShieldAlert className="h-8 w-8 text-error" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight text-primary">
        Access Denied
      </h1>
      <p className="text-muted mt-2 max-w-sm mb-8">
        You do not have permission to view this page. Please contact your administrator if you believe this is a mistake.
      </p>
      
      <div className="flex items-center gap-4">
        <Link to="/dashboard">
          <Button variant="primary">
            Go to Dashboard
          </Button>
        </Link>
        <Link to="/auth/login">
          <Button variant="secondary">
            Sign In
          </Button>
        </Link>
      </div>
    </div>
  );
}
