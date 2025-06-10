import { 
  Paper, 
  Typography, 
  Divider, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Avatar 
} from '@mui/material';
import {
  Calendar as CalendarIcon,
  Users as UsersIcon,
  Home as HomeIcon,
  Book as BookIcon,
} from 'lucide-react';

interface Activity {
  text: string;
  date: string;
  type: 'update' | 'add' | 'assign' | 'create';
}

interface ActivityListProps {
  activities: Activity[];
}

const ActivityList = ({ activities }: ActivityListProps) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'update': return <CalendarIcon size={18} />;
      case 'add': return <UsersIcon size={18} />;
      case 'assign': return <HomeIcon size={18} />;
      case 'create': return <BookIcon size={18} />;
      default: return <CalendarIcon size={18} />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'update': return 'info.light';
      case 'add': return 'success.light';
      case 'assign': return 'secondary.light';
      case 'create': return 'primary.light';
      default: return 'primary.light';
    }
  };

  return (
    <Paper sx={{ p: 2, height: '100%', borderRadius: 3, boxShadow: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Actividad Reciente
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <List>
        {activities.map((activity, index) => (
          <ListItem key={index} alignItems="flex-start" sx={{ py: 1 }}>
            <ListItemIcon>
              <Avatar 
                sx={{ 
                  bgcolor: getActivityColor(activity.type),
                  width: 36,
                  height: 36
                }}
              >
                {getActivityIcon(activity.type)}
              </Avatar>
            </ListItemIcon>
            <ListItemText
              primary={activity.text}
              secondary={activity.date}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default ActivityList;