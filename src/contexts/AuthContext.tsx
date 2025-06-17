import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import api from '../services/api';

interface User {
  id: number;
  username: string;
  email: string;
  nombre_completo?: string;
  roles?: string[];
  permissions?: string[];
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  userRoles: string[];
  userPermissions: string[];
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  userRoles: [],
  userPermissions: [],
  login: async () => {},
  logout: () => {},
  hasPermission: () => false,
  hasRole: () => false,
  hasAnyPermission: () => false,
  hasAnyRole: () => false,
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode<{ id: number; exp: number }>(token);
        const currentTime = Date.now() / 1000;

        if (decoded.exp < currentTime) {
          localStorage.removeItem('token');
          setUser(null);
          setIsLoading(false);
        } else {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          fetchUserData(decoded.id);
        }
      } catch (error) {
        console.error('Error decoding token:', error);
        localStorage.removeItem('token');
        setUser(null);
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchUserData = async (userId: number) => {
    try {
      // Obtener datos del usuario
      const userResponse = await api.get(`/api/usuarios/${userId}`);
      const userData = userResponse.data;

      // Obtener roles del usuario
      const rolesResponse = await api.get('/api/usuarios-roles/vista');
      const userRolesData = rolesResponse.data.filter(
        (ur: any) => ur.usuario_nombre === userData.username
      );
      const roles = userRolesData.map((ur: any) => ur.rol_nombre);

      // Obtener permisos basados en los roles
      const permissionsResponse = await api.get('/api/roles-permisos/vista');
      const userPermissions = permissionsResponse.data
        .filter((rp: any) => roles.includes(rp.rol_nombre))
        .map((rp: any) => rp.permiso_nombre);

      // Eliminar duplicados
      const uniquePermissions = [...new Set(userPermissions)];

      setUser({ ...userData, roles, permissions: uniquePermissions });
      setUserRoles(roles);
      setUserPermissions(uniquePermissions);
    } catch (error) {
      console.error('Error fetching user data:', error);
      localStorage.removeItem('token');
      setUser(null);
      setUserRoles([]);
      setUserPermissions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const response = await api.post('/api/auth/login', { username, password });
      const { token } = response.data;
      
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      const decoded = jwtDecode<{ id: number }>(token);
      await fetchUserData(decoded.id);
      
      // Redirigir según el rol del usuario
      const userResponse = await api.get(`/api/usuarios/${decoded.id}`);
      const userData = userResponse.data;
      
      const rolesResponse = await api.get('/api/usuarios-roles/vista');
      const userRolesData = rolesResponse.data.filter(
        (ur: any) => ur.usuario_nombre === userData.username
      );
      const roles = userRolesData.map((ur: any) => ur.rol_nombre);
      
      // Si el usuario es "usuario asignado", redirigir a horarios
      if (roles.includes('usuario asignado')) {
        navigate('/horarios');
      } else {
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Propagar el error completo para que el componente Login pueda manejarlo
      if (error?.response?.data) {
        throw error.response.data;
      } else if (error?.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Error al iniciar sesión. Verifique sus credenciales.');
      }
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    setUserRoles([]);
    setUserPermissions([]);
    navigate('/login');
  };

  // Funciones de verificación de permisos
  const hasPermission = (permission: string): boolean => {
    return userPermissions.includes(permission);
  };

  const hasRole = (role: string): boolean => {
    return userRoles.includes(role);
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some(permission => userPermissions.includes(permission));
  };

  const hasAnyRole = (roles: string[]): boolean => {
    return roles.some(role => userRoles.includes(role));
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        isLoading,
        user,
        userRoles,
        userPermissions,
        login,
        logout,
        hasPermission,
        hasRole,
        hasAnyPermission,
        hasAnyRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};