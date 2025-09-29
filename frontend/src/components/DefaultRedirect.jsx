import { useAuth } from './contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const DefaultRedirect = () => {
  const { isAdmin } = useAuth();

  if (isAdmin) {
    return <Navigate to="/" />;
  } else {
    return <Navigate to="/products" />;
  }
};

export default DefaultRedirect;