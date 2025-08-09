import { useSession } from './AuthProvider';
import { Navigate } from 'react-router-dom';
import AppNavigator from '@/navigation/AppNavigator';

const ProtectedRoute = () => {
  const session = useSession();

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <AppNavigator />;
};

export default ProtectedRoute;