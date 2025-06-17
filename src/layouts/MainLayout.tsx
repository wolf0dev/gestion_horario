import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
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
  Chip,
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
  padding: theme.spacing(2),
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: 0,
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(3),
    marginLeft: open ? 0 : `-${drawerWidth}px`,
    ...(open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    }),
  },
}));

const AppBarStyled = styled(AppBar, { shouldForwardProp: (prop) => prop !== 'open' })<{
  open?: boolean;
}>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  [theme.breakpoints.up('md')]: {
    ...(open && {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: `${drawerWidth}px`,
      transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
    }),
  },
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

// Estructura del menú con permisos requeridos
const menuStructure = [
  { 
    text: 'Dashboard', 
    icon: <DashboardIcon size={20} />, 
    path: '/dashboard',
    permissions: [], // Dashboard accesible para usuarios que NO sean "usuario asignado"
    excludeRoles: ['usuario asignado'] // Excluir usuarios asignados del dashboard
  },
  { 
    text: 'Horarios', 
    icon: <CalendarIcon size={20} />, 
    path: '/horarios',
    permissions: ['consultar_horarios', 'gestion_horarios']
  },
  {
    text: 'Recursos',
    icon: <SettingsIcon size={20} />,
    permissions: ['gestion_aulas', 'gestion_profesores'],
    excludeRoles: ['usuario asignado'], // Excluir usuarios asignados
    children: [
      { 
        text: 'Aulas', 
        icon: <HomeIcon size={18} />, 
        path: '/aulas',
        permissions: ['gestion_aulas']
      },
      { 
        text: 'Profesores', 
        icon: <UsersIcon size={18} />, 
        path: '/profesores',
        permissions: ['gestion_profesores']
      },
      { 
        text: 'Bloques Horarios', 
        icon: <ClockIcon size={18} />, 
        path: '/bloques-horarios',
        permissions: ['gestion_horarios']
      },
      { 
        text: 'Días de la Semana', 
        icon: <CalendarDaysIcon size={18} />, 
        path: '/dias-semana',
        permissions: ['gestion_horarios']
      },
    ]
  },
  {
    text: 'Académico',
    icon: <BookIcon size={20} />,
    permissions: ['gestion_uc', 'gestion_trayectos'],
    excludeRoles: ['usuario asignado'], // Excluir usuarios asignados
    children: [
      { 
        text: 'Unidades Curriculares', 
        icon: <BookIcon size={18} />, 
        path: '/unidades-curriculares',
        permissions: ['gestion_uc']
      },
      { 
        text: 'Trayectos', 
        icon: <BookOpenIcon size={18} />, 
        path: '/trayectos',
        permissions: ['gestion_trayectos']
      },
      { 
        text: 'Trayectos - UC', 
        icon: <LinkIcon size={18} />, 
        path: '/trayectos-uc',
        permissions: ['gestion_uc', 'gestion_trayectos']
      },
    ]
  },
  {
    text: 'Disponibilidad',
    icon: <UserCheckIcon size={20} />,
    permissions: ['gestion_horarios'],
    excludeRoles: ['usuario asignado'], // Excluir usuarios asignados
    children: [
      { 
        text: 'Profesores', 
        icon: <UsersIcon size={18} />, 
        path: '/disponibilidad-profesores',
        permissions: ['gestion_horarios']
      },
      { 
        text: 'Aulas', 
        icon: <MapPinIcon size={18} />, 
        path: '/disponibilidad-aulas',
        permissions: ['gestion_horarios']
      },
    ]
  },
  {
    text: 'Administración',
    icon: <UserCogIcon size={20} />,
    permissions: ['gestion_usuarios', 'gestion_roles'],
    excludeRoles: ['usuario asignado'], // Excluir usuarios asignados
    children: [
      { 
        text: 'Usuarios', 
        icon: <UserCogIcon size={18} />, 
        path: '/usuarios',
        permissions: ['gestion_usuarios']
      },
      { 
        text: 'Roles', 
        icon: <ShieldIcon size={18} />, 
        path: '/roles',
        permissions: ['gestion_roles']
      },
      { 
        text: 'Permisos', 
        icon: <KeyIcon size={18} />, 
        path: '/permisos',
        permissions: ['gestion_roles']
      },
      { 
        text: 'Usuarios - Roles', 
        icon: <LinkIcon size={18} />, 
        path: '/usuarios-roles',
        permissions: ['gestion_usuarios', 'gestion_roles']
      },
      { 
        text: 'Roles - Permisos', 
        icon: <LinkIcon size={18} />, 
        path: '/roles-permisos',
        permissions: ['gestion_roles']
      },
    ]
  },
];

export default function MainLayout() {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [open, setOpen] = useState(!isMobile);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});
  const { logout, user, userRoles, hasAnyPermission, hasRole } = useAuth();

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

  const handleNavigateToProfile = () => {
    handleCloseUserMenu();
    navigate('/perfil');
  };

  const toggleSubmenu = (menuText: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuText]: !prev[menuText]
    }));
  };

  // Función para verificar si el usuario tiene acceso a un elemento del menú
  const hasMenuAccess = (item: any): boolean => {
    // Verificar roles excluidos
    if (item.excludeRoles && item.excludeRoles.length > 0) {
      const hasExcludedRole = item.excludeRoles.some((role: string) => hasRole(role));
      if (hasExcludedRole) {
        return false;
      }
    }

    // Verificar permisos requeridos
    if (!item.permissions || item.permissions.length === 0) {
      return true; // Si no hay permisos requeridos, es accesible para todos
    }
    return hasAnyPermission(item.permissions);
  };

  const renderMenuItem = (item: any, level = 0) => {
    // Verificar si el usuario tiene acceso a este elemento
    if (!hasMenuAccess(item)) {
      return null;
    }

    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedMenus[item.text];

    // Si tiene hijos, verificar si al menos uno es accesible
    if (hasChildren) {
      const accessibleChildren = item.children.filter((child: any) => hasMenuAccess(child));
      if (accessibleChildren.length === 0) {
        return null; // No mostrar el menú padre si no hay hijos accesibles
      }
    }

    return (
      <Box key={item.text}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={hasChildren ? () => toggleSubmenu(item.text) : () => {
              navigate(item.path);
              if (isMobile) {
                handleDrawerClose();
              }
            }}
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
      <AppBarStyled position="fixed" open={open && !isMobile}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="abrir menú"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{ 
              mr: 2, 
              ...(open && !isMobile && { display: 'none' }) 
            }}
          >
            <MenuIcon />
          </IconButton>
          <Typography 
            variant="h6" 
            noWrap 
            component="div" 
            sx={{ 
              flexGrow: 1,
              fontSize: { xs: '1rem', sm: '1.25rem' }
            }}
          >
            {isMobile ? 'UBV Horarios' : 'Gestión de Horarios UBV'}
          </Typography>
          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Abrir opciones">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar 
                  alt={user?.username} 
                  src="/static/images/avatar/default.jpg"
                  sx={{ width: { xs: 32, sm: 40 }, height: { xs: 32, sm: 40 } }}
                />
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
              <MenuItem onClick={handleNavigateToProfile}>
                <ListItemIcon>
                  <UserIcon size={18} />
                </ListItemIcon>
                <Box>
                  <Typography textAlign="left">{user?.username}</Typography>
                  <Box sx={{ mt: 0.5 }}>
                    {userRoles.map((role, index) => (
                      <Chip 
                        key={index}
                        label={role} 
                        size="small" 
                        variant="outlined"
                        sx={{ mr: 0.5, mb: 0.5, fontSize: '0.7rem' }}
                      />
                    ))}
                  </Box>
                </Box>
              </MenuItem>
              <Divider />
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
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
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
      <Main open={open && !isMobile}>
        <DrawerHeader />
        <Outlet />
      </Main>
    </Box>
  );
}