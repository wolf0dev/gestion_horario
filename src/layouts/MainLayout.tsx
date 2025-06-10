import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
  Tooltip,
  Collapse,
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  LogOut as LogOutIcon,
  User as UserIcon,
  LayoutDashboard as DashboardIcon,
  Calendar as CalendarIcon,
  Home as HomeIcon,
  Users as UsersIcon,
  Book as BookIcon,
  BookOpen as BookOpenIcon,
  UserCog as UserCogIcon,
  Shield as ShieldIcon,
  Key as KeyIcon,
  Clock as ClockIcon,
  CalendarDays as CalendarDaysIcon,
  Settings as SettingsIcon,
  ChevronDown as ChevronDownIcon,
  ChevronUp as ChevronUpIcon,
  Link as LinkIcon,
  MapPin as MapPinIcon,
  UserCheck as UserCheckIcon,
} from 'lucide-react';

import { useAuth } from '../contexts/AuthContext';

const drawerWidth = 280;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<{
  open?: boolean;
}>(({ theme, open }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: `-${drawerWidth}px`,
  ...(open && {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  }),
}));

const AppBarStyled = styled(AppBar, { shouldForwardProp: (prop) => prop !== 'open' })<{
  open?: boolean;
}>(({ theme, open }) => ({
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

// Estructura del menú con submenús
const menuStructure = [
  { text: 'Dashboard', icon: <DashboardIcon size={20} />, path: '/dashboard' },
  { text: 'Horarios', icon: <CalendarIcon size={20} />, path: '/horarios' },
  {
    text: 'Recursos',
    icon: <SettingsIcon size={20} />,
    children: [
      { text: 'Aulas', icon: <HomeIcon size={18} />, path: '/aulas' },
      { text: 'Profesores', icon: <UsersIcon size={18} />, path: '/profesores' },
      { text: 'Bloques Horarios', icon: <ClockIcon size={18} />, path: '/bloques-horarios' },
      { text: 'Días de la Semana', icon: <CalendarDaysIcon size={18} />, path: '/dias-semana' },
    ]
  },
  {
    text: 'Académico',
    icon: <BookIcon size={20} />,
    children: [
      { text: 'Unidades Curriculares', icon: <BookIcon size={18} />, path: '/unidades-curriculares' },
      { text: 'Trayectos', icon: <BookOpenIcon size={18} />, path: '/trayectos' },
      { text: 'Trayectos - UC', icon: <LinkIcon size={18} />, path: '/trayectos-uc' },
    ]
  },
  {
    text: 'Disponibilidad',
    icon: <UserCheckIcon size={20} />,
    children: [
      { text: 'Profesores', icon: <UsersIcon size={18} />, path: '/disponibilidad-profesores' },
      { text: 'Aulas', icon: <MapPinIcon size={18} />, path: '/disponibilidad-aulas' },
    ]
  },
  {
    text: 'Administración',
    icon: <UserCogIcon size={20} />,
    children: [
      { text: 'Usuarios', icon: <UserCogIcon size={18} />, path: '/usuarios' },
      { text: 'Roles', icon: <ShieldIcon size={18} />, path: '/roles' },
      { text: 'Permisos', icon: <KeyIcon size={18} />, path: '/permisos' },
      { text: 'Usuarios - Roles', icon: <LinkIcon size={18} />, path: '/usuarios-roles' },
      { text: 'Roles - Permisos', icon: <LinkIcon size={18} />, path: '/roles-permisos' },
    ]
  },
];

export default function MainLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [open, setOpen] = useState(!isMobile);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});
  const { logout, user } = useAuth();

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = () => {
    handleCloseUserMenu();
    logout();
  };

  const toggleSubmenu = (menuText: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuText]: !prev[menuText]
    }));
  };

  const renderMenuItem = (item: any, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedMenus[item.text];

    return (
      <Box key={item.text}>
        <ListItem disablePadding>
          <ListItemButton
            component={hasChildren ? "div" : "a"}
            href={hasChildren ? undefined : item.path}
            onClick={hasChildren ? () => toggleSubmenu(item.text) : undefined}
            sx={{
              pl: 2 + level * 2,
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
              }
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
            {hasChildren && (
              isExpanded ? <ChevronUpIcon size={16} /> : <ChevronDownIcon size={16} />
            )}
          </ListItemButton>
        </ListItem>
        
        {hasChildren && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children.map((child: any) => renderMenuItem(child, level + 1))}
            </List>
          </Collapse>
        )}
      </Box>
    );
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBarStyled position="fixed" open={open}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="abrir menú"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{ mr: 2, ...(open && { display: 'none' }) }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Gestión de Horarios UBV
          </Typography>
          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Abrir opciones">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar alt={user?.username} src="/static/images/avatar/default.jpg" />
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              <MenuItem onClick={handleCloseUserMenu}>
                <ListItemIcon>
                  <UserIcon size={18} />
                </ListItemIcon>
                <Typography textAlign="center">Perfil</Typography>
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogOutIcon size={18} />
                </ListItemIcon>
                <Typography textAlign="center">Cerrar sesión</Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBarStyled>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant={isMobile ? "temporary" : "persistent"}
        anchor="left"
        open={open}
        onClose={handleDrawerClose}
      >
        <DrawerHeader>
          <Typography variant="h6" sx={{ flexGrow: 1, ml: 2 }}>
            Menú
          </Typography>
          <IconButton onClick={handleDrawerClose}>
            <ChevronLeftIcon />
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          {menuStructure.map((item) => renderMenuItem(item))}
        </List>
      </Drawer>
      <Main open={open}>
        <DrawerHeader />
        <Outlet />
      </Main>
    </Box>
  );
}