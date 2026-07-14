import { Navigate, useLocation } from 'react-router';

import { useAdminAuth } from '@/app/providers/use-admin-auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, authChecked } = useAdminAuth();
  const location = useLocation();

  if (!authChecked) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
