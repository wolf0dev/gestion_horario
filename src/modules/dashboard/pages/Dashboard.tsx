import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  useTheme,
} from '@mui/material';
import {
  Users as UsersIcon,
  Home as HomeIcon,
  Book as BookIcon,
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import api from '../../../services/api';

// Components
import StatCard from '../components/StatCard';

const Dashboard = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const [stats, setStats] = useState({
    profesores: 0,
    aulas: 0,
    unidadesCurriculares: 0,
  });
  const [loading, setLoading] = useState(true);

  // Cargar estadísticas reales de la API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [profesoresRes, aulasRes, ucRes, horariosRes] = await Promise.all([
          api.get('/api/profesores/todos'),
          api.get('/api/aulas/todas'),
          api.get('/api/unidades-curriculares/todas'),
        ]);

        setStats({
          profesores: profesoresRes.data.length,
          aulas: aulasRes.data.length,
          unidadesCurriculares: ucRes.data.length,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statsData = [
    { 
      title: 'Profesores', 
      value: stats.profesores, 
      icon: <UsersIcon size={24} color={theme.palette.primary.main} />, 
      color: 'primary' 
    },
    { 
      title: 'Aulas', 
      value: stats.aulas, 
      icon: <HomeIcon size={24} color={theme.palette.secondary.main} />, 
      color: 'secondary' 
    },
    { 
      title: 'Unidades Curriculares', 
      value: stats.unidadesCurriculares, 
      icon: <BookIcon size={24} color={theme.palette.success.main} />, 
      color: 'success' 
    },
  ];

  const recentActivities = [
    { text: 'Se actualizó el horario de Matemáticas I', date: '30 minutos atrás', type: 'update' as const },
    { text: 'Se agregó un nuevo profesor: María Rodríguez', date: '2 horas atrás', type: 'add' as const },
    { text: 'Se asignó el aula A205 para Física II', date: '4 horas atrás', type: 'assign' as const },
    { text: 'Se creó un nuevo horario para Informática', date: '1 día atrás', type: 'create' as const },
    { text: 'Se actualizó la disponibilidad del profesor Carlos López', date: '2 días atrás', type: 'update' as const },
  ];

  return (
    <Box sx={{ flexGrow: 1, py: 3 }}>
      {user && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h2" component="h2">
            Bienvenido, {user.username}
          </Typography>
        </Box>
      )}

      {/* Estadísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statsData.map((stat, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <StatCard {...stat} />
          </Grid>
        ))}
      </Grid>

    </Box>
  );
};

export default Dashboard;