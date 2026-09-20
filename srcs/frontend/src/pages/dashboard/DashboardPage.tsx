/*
// --- MOCK DASHBOARD FOR TESTING (Uncomment if needed) ---
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-primary mb-2">Dashboard</h1>
      
      {user ? (
        <div className="bg-slate-50 border border-border rounded-lg p-6 max-w-md">
          <p className="text-primary mb-1">
            Welcome back, <span className="font-semibold">{user.name}</span>!
          </p>
          <p className="text-sm text-muted mb-4">
            Email: {user.email}
          </p>
          <Button variant="secondary" onClick={logout}>
            Logout
          </Button>
        </div>
      ) : (
        <p className="text-muted">No user data found.</p>
      )}
    </div>
  );
}
// --------------------------------------------------------
*/

export default function DashboardPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-primary">Dashboard</h1>
      <p className="text-muted mt-2">Welcome back.</p>
    </div>
  )
}
