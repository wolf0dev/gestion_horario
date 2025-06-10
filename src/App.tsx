import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';

// Layouts
import MainLayout from './layouts/MainLayout';

// Auth Pages
import Login from './modules/auth/pages/Login';
import Register from './modules/auth/pages/Register';

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
          <Route path="/registro" element={<Register />} />
          
          {/* Protected Routes */}
          <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* Recursos */}
            <Route path="/aulas" element={<AulasPage />} />
            <Route path="/profesores" element={<ProfesoresPage />} />
            <Route path="/bloques-horarios" element={<BloquesHorariosPage />} />
            <Route path="/dias-semana" element={<DiasSemanaPage />} />
            
            {/* Académico */}
            <Route path="/unidades-curriculares" element={<UnidadesCurricularesPage />} />
            <Route path="/trayectos" element={<TrayectosPage />} />
            <Route path="/trayectos-uc" element={<TrayectosUCPage />} />
            
            {/* Horarios */}
            <Route path="/horarios" element={<HorariosPage />} />
            
            {/* Disponibilidad */}
            <Route path="/disponibilidad-profesores" element={<DisponibilidadProfesoresPage />} />
            <Route path="/disponibilidad-aulas" element={<DisponibilidadAulasPage />} />
            
            {/* Administración */}
            <Route path="/usuarios" element={<UsuariosPage />} />
            <Route path="/roles" element={<RolesPage />} />
            <Route path="/permisos" element={<PermisosPage />} />
            <Route path="/usuarios-roles" element={<UsuariosRolesPage />} />
            <Route path="/roles-permisos" element={<RolesPermisosPage />} />
          </Route>
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Box>
    </AuthProvider>
  );
}

export default App;