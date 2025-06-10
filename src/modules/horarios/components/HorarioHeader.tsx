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
  useTheme 
} from '@mui/material';
import {
  Calendar as CalendarIcon,
  Download as DownloadIcon,
  Printer as PrinterIcon,
  BookOpen as BookOpenIcon,
  Users as UsersIcon,
  Home as HomeIcon,
} from 'lucide-react';

interface HorarioHeaderProps {
  trayectos: any[];
  profesores: any[];
  aulas: any[];
  isExporting: boolean;
  onPrint: () => void;
  onExportPDF: () => void;
}

const HorarioHeader = ({
  trayectos,
  profesores,
  aulas,
  isExporting,
  onExportPDF,
}: HorarioHeaderProps) => {
  const theme = useTheme();

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 3, 
        mb: 3, 
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
          height: '200px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '50%',
          transform: 'translate(50%, -50%)',
        }
      }}
    >
      <Grid container spacing={3} alignItems="center">
        <Grid item xs={12} md={8}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar 
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                mr: 2, 
                width: 56, 
                height: 56,
                backdropFilter: 'blur(10px)',
              }}
            >
              <CalendarIcon size={28} />
            </Avatar>
            <Box>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 0.5 }}>
                Gestión de Horarios
              </Typography>
              <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                Sistema integral de programación académica
              </Typography>
            </Box>
          </Box>
          
          <Stack direction="row" spacing={2} sx={{ mt: 2 }} flexWrap="wrap">
            <Chip 
              icon={<BookOpenIcon size={16} />}
              label={`${trayectos.length} Trayectos`}
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                color: 'white',
                backdropFilter: 'blur(10px)',
              }}
            />
            <Chip 
              icon={<UsersIcon size={16} />}
              label={`${profesores.length} Profesores`}
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                color: 'white',
                backdropFilter: 'blur(10px)',
              }}
            />
            <Chip 
              icon={<HomeIcon size={16} />}
              label={`${aulas.length} Aulas`}
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                color: 'white',
                backdropFilter: 'blur(10px)',
              }}
            />
          </Stack>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, flexWrap: 'wrap' }}>
            
            <Tooltip title="Descargar PDF">
              <Button
                variant="contained"
                onClick={onExportPDF}
                disabled={isExporting}
                startIcon={isExporting ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon size={20} />}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.3)',
                  },
                }}
              >
                {isExporting ? 'Generando...' : 'Descargar PDF'}
              </Button>
            </Tooltip>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default HorarioHeader;