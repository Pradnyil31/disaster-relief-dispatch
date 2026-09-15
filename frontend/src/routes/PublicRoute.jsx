import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { ROLES } from '../utils/constants';

const ROLE_ROUTES = {
  [ROLES.ADMINISTRATOR]: '/admin',
  [ROLES.VOLUNTEER]: '/volunteer',
  [ROLES.CITIZEN]: '/citizen',
  [ROLES.DONOR]: '/donor',
};

export function PublicRoute({ children }) {
  const { isAuthenticated, user, loading } = useAuthContext();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={ROLE_ROUTES[user?.role] || '/'} replace />;
  }

  return children;
}