import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  useTheme,
  useMediaQuery,
  Paper,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Chip,
  Divider,
  LinearProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Users as UsersIcon,
  Home as HomeIcon,
  Book as BookIcon,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  TrendingUp as TrendingUpIcon,
  Activity as ActivityIcon,
  CheckCircle as CheckCircleIcon,
  AlertCircle as AlertCircleIcon,
  Info as InfoIcon,
  BarChart3 as BarChart3Icon,
  PieChart as PieChartIcon,
  RefreshCw as RefreshIcon,
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import api from '../../../services/api';

// Components
import StatCard from '../components/StatCard';

const Dashboard = () => {
  const { user, userRoles } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [stats, setStats] = useState({
    profesores: 0,
    aulas: 0,
    unidadesCurriculares: 0,
    trayectos: 0,
    horarios: 0,
    usuarios: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [systemHealth, setSystemHealth] = useState({
    horariosAsignados: 0,
    totalPosibleHorarios: 0,
    profesoresActivos: 0,
    aulasDisponibles: 0,
  });
  const [loading, setLoading] = useState(true);

  // Cargar estadísticas reales de la API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [
          profesoresRes, 
          aulasRes, 
          ucRes, 
          trayectosRes, 
          horariosRes, 
          usuariosRes
        ] = await Promise.all([
          api.get('/api/profesores/todos'),
          api.get('/api/aulas/todas'),
          api.get('/api/unidades-curriculares/todas'),
          api.get('/api/trayectos/todos'),
          api.get('/api/horarios/vista'),
          api.get('/api/usuarios/todos'),
        ]);

        const profesoresData = profesoresRes.data;
        const aulasData = aulasRes.data;
        const horariosData = horariosRes.data;

        setStats({
          profesores: profesoresData.length,
          aulas: aulasData.length,
          unidadesCurriculares: ucRes.data.length,
          trayectos: trayectosRes.data.length,
          horarios: horariosData.length,
          usuarios: usuariosRes.data.length,
        });

        // Calcular métricas de salud del sistema
        const profesoresActivos = profesoresData.filter((p: any) => p.activo).length;
        const aulasDisponibles = aulasData.filter((a: any) => a.activa).length;
        const horariosActivos = horariosData.filter((h: any) => h.activo).length;

        setSystemHealth({
          horariosAsignados: horariosActivos,
          totalPosibleHorarios: trayectosRes.data.length * 30, // Estimación
          profesoresActivos,
          aulasDisponibles,
        });

        // Generar actividad reciente simulada basada en datos reales
        const activities = [
          {
            type: 'horario',
            message: `Se han registrado ${horariosActivos} horarios en el sistema`,
            time: '2 horas',
            icon: CalendarIcon,
            color: 'primary',
          },
          {
            type: 'profesor',
            message: `${profesoresActivos} profesores están activos`,
            time: '4 horas',
            icon: UsersIcon,
            color: 'success',
          },
          {
            type: 'aula',
            message: `${aulasDisponibles} aulas disponibles para asignación`,
            time: '6 horas',
            icon: HomeIcon,
            color: 'info',
          },
          {
            type: 'sistema',
            message: 'Sistema funcionando correctamente',
            time: '1 día',
            icon: CheckCircleIcon,
            color: 'success',
          },
        ];

        setRecentActivity(activities);
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
    { 
      title: 'Trayectos', 
      value: stats.trayectos, 
      icon: <TrendingUpIcon size={isMobile ? 20 : 24} color={theme.palette.warning.main} />, 
      color: 'warning' 
    },
    { 
      title: 'Horarios Asignados', 
      value: stats.horarios, 
      icon: <CalendarIcon size={isMobile ? 20 : 24} color={theme.palette.info.main} />, 
      color: 'info' 
    },
    { 
      title: 'Usuarios del Sistema', 
      value: stats.usuarios, 
      icon: <UsersIcon size={isMobile ? 20 : 24} color={theme.palette.error.main} />, 
      color: 'error' 
    },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const calculateProgress = (current: number, total: number) => {
    return total > 0 ? (current / total) * 100 : 0;
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>Cargando dashboard...</Typography>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      flexGrow: 1, 
      py: { xs: 2, sm: 3 },
      px: { xs: 1, sm: 0 }
    }}>
      {/* Saludo personalizado */}
      {user && (
        <Paper sx={{ 
          p: { xs: 2, sm: 3 }, 
          mb: { xs: 2, sm: 3 }, 
          borderRadius: 3,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={8}>
                <Typography 
                  variant={isMobile ? "h5" : "h4"} 
                  component="h1"
                  sx={{ fontWeight: 700, mb: 1 }}
                >
                  {getGreeting()}, {user.nombre_completo || user.username}
                </Typography>
                <Typography variant="subtitle1" sx={{ opacity: 0.9, mb: 2 }}>
                  Bienvenido al Sistema de Gestión de Horarios UBV
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {userRoles.map((role, index) => (
                    <Chip
                      key={index}
                      label={role}
                      size="small"
                      sx={{ 
                        bgcolor: 'rgba(255,255,255,0.2)', 
                        color: 'white',
                        backdropFilter: 'blur(10px)'
                      }}
                    />
                  ))}
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: { xs: 'center', md: 'right' } }}>
                  <Avatar
                    sx={{
                      width: { xs: 60, sm: 80 },
                      height: { xs: 60, sm: 80 },
                      bgcolor: 'rgba(255,255,255,0.2)',
                      fontSize: { xs: '1.5rem', sm: '2rem' },
                      mx: { xs: 'auto', md: 0 },
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    {user.username.charAt(0).toUpperCase()}
                  </Avatar>
                </Box>
              </Grid>
            </Grid>
          </Box>
          <Box sx={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
            zIndex: 0,
          }} />
        </Paper>
      )}

      {/* Estadísticas principales */}
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 3, sm: 4 } }}>
        {statsData.map((stat, index) => (
          <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
            <StatCard {...stat} />
          </Grid>
        ))}
      </Grid>

      {/* Métricas del sistema y actividad reciente */}
      <Grid container spacing={{ xs: 2, sm: 3 }}>
        {/* Métricas del sistema */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <BarChart3Icon size={24} color={theme.palette.primary.main} />
                <Typography variant="h6" sx={{ ml: 1, fontWeight: 600 }}>
                  Estado del Sistema
                </Typography>
                <Tooltip title="Actualizar datos">
                  <IconButton size="small" sx={{ ml: 'auto' }}>
                    <RefreshIcon size={18} />
                  </IconButton>
                </Tooltip>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="textSecondary">
                    Horarios Asignados
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {systemHealth.horariosAsignados} / {systemHealth.totalPosibleHorarios}
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={calculateProgress(systemHealth.horariosAsignados, systemHealth.totalPosibleHorarios)}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="textSecondary">
                    Profesores Activos
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {systemHealth.profesoresActivos} / {stats.profesores}
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={calculateProgress(systemHealth.profesoresActivos, stats.profesores)}
                  color="success"
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>

              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="textSecondary">
                    Aulas Disponibles
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {systemHealth.aulasDisponibles} / {stats.aulas}
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={calculateProgress(systemHealth.aulasDisponibles, stats.aulas)}
                  color="info"
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Actividad reciente */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <ActivityIcon size={24} color={theme.palette.secondary.main} />
                <Typography variant="h6" sx={{ ml: 1, fontWeight: 600 }}>
                  Actividad Reciente
                </Typography>
              </Box>

              <List sx={{ p: 0 }}>
                {recentActivity.map((activity, index) => (
                  <Box key={index}>
                    <ListItem sx={{ px: 0, py: 1 }}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <Avatar 
                          sx={{ 
                            width: 32, 
                            height: 32,
                            bgcolor: `${activity.color}.light`
                          }}
                        >
                          <activity.icon size={16} />
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={activity.message}
                        secondary={`Hace ${activity.time}`}
                        primaryTypographyProps={{
                          fontSize: '0.875rem',
                          fontWeight: 500
                        }}
                        secondaryTypographyProps={{
                          fontSize: '0.75rem'
                        }}
                      />
                    </ListItem>
                    {index < recentActivity.length - 1 && <Divider />}
                  </Box>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Accesos rápidos */}
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mt: { xs: 2, sm: 3 } }}>
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <PieChartIcon size={24} color={theme.palette.warning.main} />
                <Typography variant="h6" sx={{ ml: 1, fontWeight: 600 }}>
                  Accesos Rápidos
                </Typography>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper 
                    sx={{ 
                      p: 2, 
                      textAlign: 'center', 
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 4
                      }
                    }}
                    onClick={() => window.location.href = '/horarios'}
                  >
                    <CalendarIcon size={32} color={theme.palette.primary.main} />
                    <Typography variant="subtitle2" sx={{ mt: 1, fontWeight: 600 }}>
                      Ver Horarios
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper 
                    sx={{ 
                      p: 2, 
                      textAlign: 'center', 
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 4
                      }
                    }}
                    onClick={() => window.location.href = '/profesores'}
                  >
                    <UsersIcon size={32} color={theme.palette.secondary.main} />
                    <Typography variant="subtitle2" sx={{ mt: 1, fontWeight: 600 }}>
                      Gestionar Profesores
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper 
                    sx={{ 
                      p: 2, 
                      textAlign: 'center', 
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 4
                      }
                    }}
                    onClick={() => window.location.href = '/aulas'}
                  >
                    <HomeIcon size={32} color={theme.palette.success.main} />
                    <Typography variant="subtitle2" sx={{ mt: 1, fontWeight: 600 }}>
                      Gestionar Aulas
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper 
                    sx={{ 
                      p: 2, 
                      textAlign: 'center', 
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 4
                      }
                    }}
                    onClick={() => window.location.href = '/perfil'}
                  >
                    <UsersIcon size={32} color={theme.palette.info.main} />
                    <Typography variant="subtitle2" sx={{ mt: 1, fontWeight: 600 }}>
                      Mi Perfil
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;