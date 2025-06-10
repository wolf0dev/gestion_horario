import { Paper, Tabs, Tab, Box, useTheme } from '@mui/material';
import { BookOpen as BookOpenIcon } from 'lucide-react';

interface HorarioTabsProps {
  trayectos: any[];
  tabValue: number;
  onTabChange: (event: React.SyntheticEvent, newValue: number) => void;
}

const HorarioTabs = ({ trayectos, tabValue, onTabChange }: HorarioTabsProps) => {
  const theme = useTheme();

  return (
    <Paper sx={{ width: '100%', mb: 3, borderRadius: 2, overflow: 'hidden' }}>
      <Tabs
        value={tabValue}
        onChange={onTabChange}
        textColor="primary"
        indicatorColor="primary"
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          bgcolor: theme.palette.grey[50],
          '& .MuiTab-root': {
            fontWeight: 600,
            textTransform: 'none',
            fontSize: '1rem',
          },
        }}
      >
        {trayectos.map((trayecto, index) => (
          <Tab 
            key={trayecto.trayecto_id} 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BookOpenIcon size={18} />
                {trayecto.nombre}
              </Box>
            }
          />
        ))}
      </Tabs>
    </Paper>
  );
};

export default HorarioTabs;