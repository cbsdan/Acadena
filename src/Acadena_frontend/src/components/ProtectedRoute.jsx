import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks';

function ProtectedRoute({ 
  children, 
  requireAuth = true, 
  requireUser = false, 
  allowedRoles = [] 
}) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireUser && !user) {
    return <Navigate to="/setup" replace />;
  }

  if (allowedRoles.length > 0 && user && !allowedRoles.some(role => user.role[role])) {
    return <Navigate to="/access-denied" replace />;
  }

  return children;
}

export default ProtectedRoute;
