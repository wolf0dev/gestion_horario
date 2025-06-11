import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  useTheme,
  useMediaQuery,
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
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
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
        const [profesoresRes, aulasRes, ucRes] = await Promise.all([
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
      icon: <UsersIcon size={isMobile ? 20 : 24} color={theme.palette.primary.main} />, 
      color: 'primary' 
    },
    { 
      title: 'Aulas', 
      value: stats.aulas, 
      icon: <HomeIcon size={isMobile ? 20 : 24} color={theme.palette.secondary.main} />, 
      color: 'secondary' 
    },
    { 
      title: 'Unidades Curriculares', 
      value: stats.unidadesCurriculares, 
      icon: <BookIcon size={isMobile ? 20 : 24} color={theme.palette.success.main} />, 
      color: 'success' 
    },
  ];

  return (
    <Box sx={{ 
      flexGrow: 1, 
      py: { xs: 2, sm: 3 },
      px: { xs: 1, sm: 0 }
    }}>
      {user && (
        <Box sx={{ mb: { xs: 3, sm: 4 } }}>
          <Typography 
            variant={isMobile ? "h4" : "h2"} 
            component="h2"
            sx={{
              fontSize: { xs: '1rem', sm: '2rem', md: '2,5rem' },
              textAlign: { xs: 'center', sm: 'left' }
            }}
          >
            Bienvenido, {user.username}
          </Typography>
        </Box>
      )}

      {/* Estadísticas */}
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 3, sm: 4 } }}>
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