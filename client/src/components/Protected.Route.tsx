import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';

const ProtectedRoute = () => {
  const { isAuthenticated, isHydrated } = useAuthStore();
  const location = useLocation();

  // Wait for zustand to rehydrate from localStorage before redirecting
  if (!isHydrated) return null;

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
