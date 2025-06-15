import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Button, 
  Tooltip, 
  Avatar, 
  Stack, 
  Chip, 
  CircularProgress,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Calendar as CalendarIcon,
  Download as DownloadIcon,
  BookOpen as BookOpenIcon,
  Users as UsersIcon,
  Home as HomeIcon,
} from 'lucide-react';

interface HorarioHeaderProps {
  profesores: any[];
  trayectos: any[];
  aulas: any[];
  isExporting: boolean;
  onPrint: () => void;
  onExportPDF: () => void;
}

const HorarioHeader = ({
  profesores,
  trayectos,
  aulas,
  isExporting,
  onExportPDF,
}: HorarioHeaderProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  
  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: { xs: 2, sm: 3 }, 
        mb: { xs: 2, sm: 3 }, 
        borderRadius: 3,
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: 0,
          width: { xs: '100px', sm: '200px' },
          height: { xs: '100px', sm: '200px' },
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '50%',
          transform: 'translate(50%, -50%)',
        }
      }}
    >
      <Grid container spacing={{ xs: 2, sm: 3 }} alignItems="center">
        <Grid item xs={12} md={8}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 1, sm: 2 } }}>
            <Avatar 
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                mr: { xs: 1, sm: 2 }, 
                width: { xs: 40, sm: 56 },
                height: { xs: 40, sm: 56 },
                backdropFilter: 'blur(10px)',
              }}
            >
              <CalendarIcon size={isMobile ? 20 : 28} />
            </Avatar>
            <Box>
              <Typography 
                variant={isMobile ? "h5" : "h4"} 
                component="h1" 
                sx={{ 
                  fontWeight: 700, 
                  mb: 0.5,
                  fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }
                }}
              >
                {isSmall ? 'Horarios' : 'Gestión de Horarios'}
              </Typography>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  opacity: 0.9,
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  display: { xs: 'none', sm: 'block' }
                }}
              >
                Sistema integral de programación académica por profesor
              </Typography>
            </Box>
          </Box>
          
          <Stack 
            direction="row" 
            spacing={{ xs: 1, sm: 2 }} 
            sx={{ mt: { xs: 1, sm: 2 } }} 
            flexWrap="wrap"
            useFlexGap
          >
            <Chip 
              icon={<UsersIcon size={14} />}
              label={`${profesores.length} Prof${isMobile ? '.' : 'esores'}`}
              size={isMobile ? "small" : "medium"}
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                color: 'white',
                backdropFilter: 'blur(10px)',
                fontSize: { xs: '0.75rem', sm: '0.875rem' }
              }}
            />
            <Chip 
              icon={<BookOpenIcon size={14} />}
              label={`${trayectos.length} Trayecto${trayectos.length !== 1 ? 's' : ''}`}
              size={isMobile ? "small" : "medium"}
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                color: 'white',
                backdropFilter: 'blur(10px)',
                fontSize: { xs: '0.75rem', sm: '0.875rem' }
              }}
            />
            <Chip 
              icon={<HomeIcon size={14} />}
              label={`${aulas.length} Aula${aulas.length !== 1 ? 's' : ''}`}
              size={isMobile ? "small" : "medium"}
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                color: 'white',
                backdropFilter: 'blur(10px)',
                fontSize: { xs: '0.75rem', sm: '0.875rem' }
              }}
            />
          </Stack>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: { xs: 'center', md: 'flex-end' }, 
            gap: { xs: 1, sm: 2 }, 
            flexWrap: 'wrap' 
          }}>
            <Tooltip title="Descargar PDF">
              <Button
                variant="contained"
                onClick={onExportPDF}
                disabled={isExporting}
                size={isMobile ? "small" : "medium"}
                startIcon={isExporting ? <CircularProgress size={16} color="inherit" /> : <DownloadIcon size={16} />}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  px: { xs: 2, sm: 3 },
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.3)',
                  },
                }}
              >
                {isExporting ? 'Generando...' : (isMobile ? 'PDF' : 'Descargar PDF')}
              </Button>
            </Tooltip>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default HorarioHeader;