import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';

// Layouts
import MainLayout from './layouts/MainLayout';

// Auth Pages
import Login from './modules/auth/pages/Login';

// Protected Routes
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Dashboard from './modules/dashboard/pages/Dashboard';
import AulasPage from './modules/aulas/pages/AulasPage';
import ProfesoresPage from './modules/profesores/pages/ProfesoresPage';
import HorariosPage from './modules/horarios/pages/HorariosPage';
import UnidadesCurricularesPage from './modules/curriculum/pages/UnidadesCurricularesPage';
import TrayectosPage from './modules/curriculum/pages/TrayectosPage';
import UsuariosPage from './modules/usuarios/pages/UsuariosPage';
import RolesPage from './modules/roles/pages/RolesPage';
import PermisosPage from './modules/permisos/pages/PermisosPage';
import BloquesHorariosPage from './modules/bloques-horarios/pages/BloquesHorariosPage';
import DiasSemanaPage from './modules/dias-semana/pages/DiasSemanaPage';
import PerfilPage from './modules/perfil/pages/PerfilPage';

// Nuevos módulos
import UsuariosRolesPage from './modules/usuarios-roles/pages/UsuariosRolesPage';
import RolesPermisosPage from './modules/roles-permisos/pages/RolesPermisosPage';
import TrayectosUCPage from './modules/trayectos-uc/pages/TrayectosUCPage';
import DisponibilidadProfesoresPage from './modules/disponibilidad-profesores/pages/DisponibilidadProfesoresPage';
import DisponibilidadAulasPage from './modules/disponibilidad-aulas/pages/DisponibilidadAulasPage';

// Context
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          
          {/* Protected Routes */}
          <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* Perfil - Accesible para todos los usuarios autenticados */}
            <Route path="/perfil" element={<PerfilPage />} />
            
            {/* Recursos */}
            <Route 
              path="/aulas" 
              element={
                <ProtectedRoute requiredPermissions={['gestion_aulas']}>
                  <AulasPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profesores" 
              element={
                <ProtectedRoute requiredPermissions={['gestion_profesores']}>
                  <ProfesoresPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/bloques-horarios" 
              element={
                <ProtectedRoute requiredPermissions={['gestion_horarios']}>
                  <BloquesHorariosPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dias-semana" 
              element={
                <ProtectedRoute requiredPermissions={['gestion_horarios']}>
                  <DiasSemanaPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Académico */}
            <Route 
              path="/unidades-curriculares" 
              element={
                <ProtectedRoute requiredPermissions={['gestion_uc']}>
                  <UnidadesCurricularesPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/trayectos" 
              element={
                <ProtectedRoute requiredPermissions={['gestion_trayectos']}>
                  <TrayectosPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/trayectos-uc" 
              element={
                <ProtectedRoute requiredPermissions={['gestion_uc', 'gestion_trayectos']}>
                  <TrayectosUCPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Horarios */}
            <Route 
              path="/horarios" 
              element={
                <ProtectedRoute requiredPermissions={['consultar_horarios', 'gestion_horarios']}>
                  <HorariosPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Disponibilidad */}
            <Route 
              path="/disponibilidad-profesores" 
              element={
                <ProtectedRoute requiredPermissions={['gestion_horarios']}>
                  <DisponibilidadProfesoresPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/disponibilidad-aulas" 
              element={
                <ProtectedRoute requiredPermissions={['gestion_horarios']}>
                  <DisponibilidadAulasPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Administración */}
            <Route 
              path="/usuarios" 
              element={
                <ProtectedRoute requiredPermissions={['gestion_usuarios']}>
                  <UsuariosPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/roles" 
              element={
                <ProtectedRoute requiredPermissions={['gestion_roles']}>
                  <RolesPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/permisos" 
              element={
                <ProtectedRoute requiredPermissions={['gestion_roles']}>
                  <PermisosPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/usuarios-roles" 
              element={
                <ProtectedRoute requiredPermissions={['gestion_usuarios', 'gestion_roles']}>
                  <UsuariosRolesPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/roles-permisos" 
              element={
                <ProtectedRoute requiredPermissions={['gestion_roles']}>
                  <RolesPermisosPage />
                </ProtectedRoute>
              } 
            />
          </Route>
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Box>
    </AuthProvider>
  );
}

export default App;