import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Avatar,
  Chip,
  Button,
  TextField,
  Snackbar,
  Alert,
  Divider,
  Card,
  CardContent,
  IconButton,
  InputAdornment,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  User as UserIcon,
  Mail as MailIcon,
  Shield as ShieldIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  X as CloseIcon,
  Eye as EyeIcon,
  EyeOff as EyeOffIcon,
  Lock as LockIcon,
} from 'lucide-react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

import { useAuth } from '../../../contexts/AuthContext';
import api from '../../../services/api';

// Esquema de validación
const validationSchema = Yup.object().shape({
  username: Yup.string()
    .min(3, 'El nombre de usuario debe tener al menos 3 caracteres')
    .required('El nombre de usuario es requerido'),
  nombre_completo: Yup.string()
    .min(2, 'El nombre completo debe tener al menos 2 caracteres')
    .required('El nombre completo es requerido'),
  email: Yup.string()
    .email('Email inválido')
    .required('El email es requerido'),
  password: Yup.string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .nullable(),
  confirmPassword: Yup.string()
    .nullable()
    .when('password', {
      is: (password: string) => password && password.length > 0,
      then: (schema) => schema
        .required('Confirme la nueva contraseña')
        .oneOf([Yup.ref('password')], 'Las contraseñas no coinciden'),
      otherwise: (schema) => schema.nullable(),
    }),
});

const PerfilPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, userRoles, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' as const 
  });

  const initialValues = {
    username: user?.username || '',
    nombre_completo: user?.nombre_completo || '',
    email: user?.email || '',
    password: '',
    confirmPassword: '',
  };

  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    try {
      const updateData: any = {
        usuario_id: user?.id,
        username: values.username,
        email: values.email,
        nombre_completo: values.nombre_completo,
        activo: true
      };

      // Solo incluir password si se proporcionó una nueva
      if (values.password && values.password.trim() !== '') {
        updateData.password = values.password;
      }

      await api.put('/api/usuarios/actualizar', updateData);

      setIsEditing(false);
      showSnackbar('Perfil actualizado exitosamente', 'success');

      // Si cambió el username o email, sugerir reiniciar sesión
      if (values.username !== user?.username || values.email !== user?.email) {
        setTimeout(() => {
          showSnackbar(
            'Se han actualizado datos críticos. Se recomienda cerrar sesión y volver a iniciar.',
            'warning'
          );
        }, 2000);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showSnackbar('Error al actualizar el perfil', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (!user) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6">Cargando información del usuario...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Mi Perfil
      </Typography>

      <Grid container spacing={3}>
        {/* Panel de información del usuario */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: 'fit-content', borderRadius: 3, boxShadow: 3 }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Avatar
                sx={{
                  width: { xs: 80, sm: 100 },
                  height: { xs: 80, sm: 100 },
                  mx: 'auto',
                  mb: 2,
                  bgcolor: theme.palette.primary.main,
                  fontSize: { xs: '2rem', sm: '2.5rem' },
                }}
              >
                {user.username.charAt(0).toUpperCase()}
              </Avatar>

              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                {user.nombre_completo || user.username}
              </Typography>

              <Typography variant="body2" color="textSecondary" gutterBottom>
                @{user.username}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                <MailIcon size={16} />
                <Typography variant="body2" sx={{ ml: 1 }}>
                  {user.email}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                  <ShieldIcon size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                  Roles Asignados
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                  {userRoles.length > 0 ? (
                    userRoles.map((role, index) => (
                      <Chip
                        key={index}
                        label={role}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    ))
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      Sin roles asignados
                    </Typography>
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Panel de edición */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Información Personal
              </Typography>
              {!isEditing && (
                <Button
                  variant="outlined"
                  startIcon={<EditIcon size={18} />}
                  onClick={() => setIsEditing(true)}
                  size={isMobile ? 'small' : 'medium'}
                >
                  Editar
                </Button>
              )}
            </Box>

            {!isEditing ? (
              // Vista de solo lectura
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      Nombre de Usuario
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {user.username}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      Nombre Completo
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {user.nombre_completo || 'No especificado'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      Correo Electrónico
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {user.email}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            ) : (
              // Formulario de edición
              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({ errors, touched, isSubmitting, values }) => (
                  <Form>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <Field
                          as={TextField}
                          name="username"
                          label="Nombre de Usuario"
                          fullWidth
                          error={touched.username && errors.username ? true : false}
                          helperText={touched.username && errors.username}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <UserIcon size={20} />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Field
                          as={TextField}
                          name="nombre_completo"
                          label="Nombre Completo"
                          fullWidth
                          error={touched.nombre_completo && errors.nombre_completo ? true : false}
                          helperText={touched.nombre_completo && errors.nombre_completo}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Field
                          as={TextField}
                          name="email"
                          label="Correo Electrónico"
                          type="email"
                          fullWidth
                          error={touched.email && errors.email ? true : false}
                          helperText={touched.email && errors.email}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <MailIcon size={20} />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Field
                          as={TextField}
                          name="password"
                          label="Nueva Contraseña (opcional)"
                          type={showPassword ? 'text' : 'password'}
                          fullWidth
                          placeholder="Dejar vacío para mantener la actual"
                          error={touched.password && errors.password ? true : false}
                          helperText={touched.password && errors.password}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <LockIcon size={20} />
                              </InputAdornment>
                            ),
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={() => setShowPassword(!showPassword)}
                                  edge="end"
                                >
                                  {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Field
                          as={TextField}
                          name="confirmPassword"
                          label="Confirmar Nueva Contraseña"
                          type={showConfirmPassword ? 'text' : 'password'}
                          fullWidth
                          disabled={!values.password}
                          error={touched.confirmPassword && errors.confirmPassword ? true : false}
                          helperText={touched.confirmPassword && errors.confirmPassword}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <LockIcon size={20} />
                              </InputAdornment>
                            ),
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                  edge="end"
                                  disabled={!values.password}
                                >
                                  {showConfirmPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                    </Grid>

                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'flex-end', 
                      gap: 2, 
                      mt: 3,
                      flexDirection: { xs: 'column', sm: 'row' }
                    }}>
                      <Button
                        variant="outlined"
                        onClick={() => setIsEditing(false)}
                        startIcon={<CloseIcon size={18} />}
                        disabled={isSubmitting}
                        fullWidth={isMobile}
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        startIcon={<SaveIcon size={18} />}
                        disabled={isSubmitting}
                        fullWidth={isMobile}
                      >
                        {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                      </Button>
                    </Box>
                  </Form>
                )}
              </Formik>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Notificaciones */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: isMobile ? 'center' : 'left' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PerfilPage;