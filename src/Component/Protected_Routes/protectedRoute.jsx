import { Navigate } from 'react-router-dom';
import { useAuth } from '../Context/authContext.jsx';

/**
 * 
 * @param {children, token} param0 
 * @returns 
 * The ProtectedRoute component takes children (the route component to protect) and token as props. If no token exists, 
 * it redirects to /login using Navigate with the replace prop to avoid adding an entry to the browser history.
 */

export default function ProtectedRoute({ children, token }) {
    const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return < Navigate to="/login" replace />;
  }

  return children;
}