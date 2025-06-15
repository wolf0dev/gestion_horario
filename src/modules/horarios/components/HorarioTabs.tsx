import { Paper, Tabs, Tab, Box, useTheme, useMediaQuery } from '@mui/material';
import { Users as UsersIcon } from 'lucide-react';

interface HorarioTabsProps {
  profesores: any[];
  tabValue: number;
  onTabChange: (event: React.SyntheticEvent, newValue: number) => void;
}

const HorarioTabs = ({ profesores, tabValue, onTabChange }: HorarioTabsProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Paper sx={{ 
      width: '100%', 
      mb: { xs: 2, sm: 3 }, 
      borderRadius: 2, 
      overflow: 'hidden' 
    }}>
      <Tabs
        value={tabValue}
        onChange={onTabChange}
        textColor="primary"
        indicatorColor="primary"
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        sx={{
          bgcolor: theme.palette.grey[50],
          '& .MuiTab-root': {
            fontWeight: 600,
            textTransform: 'none',
            fontSize: { xs: '0.875rem', sm: '1rem' },
            minWidth: { xs: 120, sm: 160 },
            px: { xs: 1, sm: 2 },
          },
          '& .MuiTabs-scrollButtons': {
            '&.Mui-disabled': {
              opacity: 0.3,
            },
          },
        }}
      >
        {profesores.map((profesor, index) => (
          <Tab 
            key={profesor.profesor_id} 
            label={
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: { xs: 0.5, sm: 1 },
                flexDirection: { xs: 'column', sm: 'row' }
              }}>
                <UsersIcon size={isMobile ? 16 : 18} />
                <Box sx={{ 
                  textAlign: { xs: 'center', sm: 'left' },
                  lineHeight: 1.2
                }}>
                  {`${profesor.nombre} ${profesor.apellido}`}
                </Box>
              </Box>
            }
          />
        ))}
      </Tabs>
    </Paper>
  );
};

export default HorarioTabs;