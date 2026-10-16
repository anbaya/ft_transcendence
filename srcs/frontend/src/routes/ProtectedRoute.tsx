import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

export default function ProtectedRoute() {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  // Outlet renders the nested child routes (e.g., DashboardPage, ProjectsPage).
  // Using user.id as key ensures that when switching users, all protected pages/components
  // are completely remounted with clean state.
  return <Outlet key={user ? String(user.id) : 'auth-root'} />;
}
