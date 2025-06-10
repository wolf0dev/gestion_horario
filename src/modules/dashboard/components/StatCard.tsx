import { Card, CardContent, Box, Typography, Avatar, useTheme, useMediaQuery } from '@mui/material';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

const StatCard = ({ title, value, icon, color }: StatCardProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  return (
    <Card sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      boxShadow: 3,
      borderRadius: 3,
      transition: 'transform 0.3s, box-shadow 0.3s',
      '&:hover': {
        transform: isMobile ? 'none' : 'translateY(-5px)',
        boxShadow: 6,
      }
    }}>
      <CardContent sx={{ 
        flexGrow: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        padding: { xs: 2, sm: 3 },
        textAlign: 'center'
      }}>
        <Box
          sx={{
            backgroundColor: `${color}.light`,
            borderRadius: '50%',
            padding: { xs: 1.5, sm: 2 },
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: { xs: 1.5, sm: 2 },
            width: { xs: 48, sm: 56 },
            height: { xs: 48, sm: 56 },
          }}
        >
          {icon}
        </Box>
        <Typography 
          variant={isMobile ? "h4" : "h3"} 
          component="div" 
          sx={{ 
            fontWeight: 'bold',
            fontSize: { xs: '2rem', sm: '2.5rem' },
            mb: 1
          }}
        >
          {value}
        </Typography>
        <Typography 
          color="text.secondary" 
          sx={{ 
            textAlign: 'center',
            fontSize: { xs: '0.875rem', sm: '1rem' },
            lineHeight: 1.2
          }}
        >
          {title}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default StatCard;