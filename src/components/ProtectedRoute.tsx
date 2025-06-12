import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { Box, Typography, Paper, Alert } from '@mui/material';
import { Shield as ShieldIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermissions?: string[];
  requiredRoles?: string[];
  requireAll?: boolean; // Si true, requiere TODOS los permisos/roles. Si false, requiere AL MENOS UNO
}

const ProtectedRoute = ({ 
  children, 
  requiredPermissions = [], 
  requiredRoles = [],
  requireAll = false 
}: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, hasPermission, hasRole, hasAnyPermission, hasAnyRole } = useAuth();

  if (isLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <Typography>Cargando...</Typography>
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Verificar permisos si se especificaron
  if (requiredPermissions.length > 0) {
    const hasRequiredPermissions = requireAll 
      ? requiredPermissions.every(permission => hasPermission(permission))
      : hasAnyPermission(requiredPermissions);

    if (!hasRequiredPermissions) {
      return (
        <Box sx={{ p: 3 }}>
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <ShieldIcon size={64} color="#f44336" style={{ marginBottom: 16 }} />
            <Typography variant="h5" gutterBottom color="error">
              Acceso Denegado
            </Typography>
            <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
              No tienes los permisos necesarios para acceder a esta sección.
            </Typography>
            <Alert severity="warning" sx={{ mt: 2 }}>
              Permisos requeridos: {requiredPermissions.join(', ')}
            </Alert>
          </Paper>
        </Box>
      );
    }
  }

  // Verificar roles si se especificaron
  if (requiredRoles.length > 0) {
    const hasRequiredRoles = requireAll 
      ? requiredRoles.every(role => hasRole(role))
      : hasAnyRole(requiredRoles);

    if (!hasRequiredRoles) {
      return (
        <Box sx={{ p: 3 }}>
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <ShieldIcon size={64} color="#f44336" style={{ marginBottom: 16 }} />
            <Typography variant="h5" gutterBottom color="error">
              Acceso Denegado
            </Typography>
            <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
              No tienes el rol necesario para acceder a esta sección.
            </Typography>
            <Alert severity="warning" sx={{ mt: 2 }}>
              Roles requeridos: {requiredRoles.join(', ')}
            </Alert>
          </Paper>
        </Box>
      );
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;