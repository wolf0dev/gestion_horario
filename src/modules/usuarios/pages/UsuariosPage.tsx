import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Snackbar,
  Alert,
  Paper,
} from '@mui/material';
import { X as CloseIcon } from 'lucide-react';

import GenericTable, { Column } from '../../../components/generic/GenericTable';
import GenericForm, { FormField } from '../../../components/generic/GenericForm';
import api from '../../../services/api';

// Tipo para el modelo de Usuario
interface Usuario {
  usuario_id: number;
  username: string;
  email: string;
  nombre_completo: string;
  activo: boolean;
}

// Valores iniciales para un usuario nuevo
const initialValues: Omit<Usuario, 'usuario_id'> = {
  username: '',
  email: '',
  nombre_completo: '',
  activo: true,
};

const UsuariosPage = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentUsuario, setCurrentUsuario] = useState<Usuario | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as const });

  // Definición de columnas para la tabla
  const columns: Column<Usuario>[] = [
    { id: 'username', label: 'Usuario', minWidth: 150, sortable: true },
    { id: 'nombre_completo', label: 'Nombre Completo', minWidth: 200, sortable: true },
    { id: 'email', label: 'Email', minWidth: 200, sortable: true },
    { 
      id: 'activo', 
      label: 'Estado', 
      minWidth: 100, 
      sortable: true,
      format: (value: boolean) => value ? 'Activo' : 'Inactivo'
    },
  ];

  // Definición de campos para el formulario
  const getFormFields = (): FormField[] => [
    { 
      name: 'username', 
      label: 'Nombre de Usuario', 
      type: 'text', 
      required: true,
      xs: 12,
      sm: 6,
    },
    { 
      name: 'nombre_completo', 
      label: 'Nombre Completo', 
      type: 'text', 
      required: true,
      xs: 12,
      sm: 6,
    },
    { 
      name: 'email', 
      label: 'Correo Electrónico', 
      type: 'email', 
      required: true,
      xs: 12,
      sm: 6,
    },
    ...(currentUsuario ? [
      { 
        name: 'password', 
        label: 'Nueva Contraseña (opcional)', 
        type: 'password' as const, 
        required: false,
        placeholder: 'Dejar vacío para mantener la actual',
        xs: 12,
        sm: 6,
      }
    ] : [
      { 
        name: 'password', 
        label: 'Contraseña', 
        type: 'password' as const, 
        required: true,
        xs: 12,
        sm: 6,
      }
    ]),
    { 
      name: 'activo', 
      label: 'Usuario Activo', 
      type: 'boolean' as const,
      xs: 12,
    },
  ];

  // Cargar datos
  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const response = await api.get('/api/usuarios/todos');
        setUsuarios(response.data);
      } catch (error) {
        console.error('Error fetching usuarios:', error);
        showSnackbar('Error al cargar usuarios', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchUsuarios();
  }, []);

  // Manejar apertura del formulario para agregar
  const handleAdd = () => {
    setCurrentUsuario(null);
    setOpenDialog(true);
  };

  // Manejar apertura del formulario para editar
  const handleEdit = (usuario: Usuario) => {
    setCurrentUsuario(usuario);
    setOpenDialog(true);
  };

  // Manejar eliminación
  const handleDelete = async (usuario: Usuario) => {
    try {
      await api.delete(`/api/usuarios/eliminar/${usuario.usuario_id}`);
      setUsuarios(usuarios.filter(u => u.usuario_id !== usuario.usuario_id));
      showSnackbar('Usuario eliminado exitosamente', 'success');
    } catch (error) {
      console.error('Error deleting usuario:', error);
      showSnackbar('Error al eliminar usuario', 'error');
    }
  };

  // Manejar envío del formulario (agregar o editar)
  const handleSubmit = async (values: any) => {
    try {
      if (currentUsuario) {
        // Actualizar usuario existente
        const updateData: any = {
          usuario_id: currentUsuario.usuario_id,
          username: values.username,
          email: values.email,
          nombre_completo: values.nombre_completo,
          activo: values.activo
        };

        // Solo incluir password si se proporcionó una nueva
        if (values.password && values.password.trim() !== '') {
          updateData.password = values.password;
        }
        
        await api.put('/api/usuarios/actualizar', updateData);
        
        // Actualizar el estado local
        setUsuarios(usuarios.map(u => 
          u.usuario_id === currentUsuario.usuario_id 
            ? { 
                usuario_id: currentUsuario.usuario_id,
                username: values.username,
                email: values.email,
                nombre_completo: values.nombre_completo,
                activo: values.activo
              }
            : u
        ));
        showSnackbar('Usuario actualizado exitosamente', 'success');
      } else {
        // Crear nuevo usuario
        await api.post('/api/auth/registro', {
          username: values.username,
          email: values.email,
          nombre_completo: values.nombre_completo,
          password: values.password,
          activo: values.activo
        });
        
        // Recargar la lista para obtener el ID generado
        const response = await api.get('/api/usuarios/todos');
        setUsuarios(response.data);
        showSnackbar('Usuario registrado exitosamente', 'success');
      }
      setOpenDialog(false);
    } catch (error) {
      console.error('Error submitting usuario:', error);
      showSnackbar(
        `Error al ${currentUsuario ? 'actualizar' : 'registrar'} usuario`,
        'error'
      );
    }
  };

  // Mostrar mensaje
  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  // Cerrar mensaje
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Gestión de Usuarios
      </Typography>

      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Typography variant="body1" gutterBottom>
          Administre los usuarios del sistema. Solo los administradores pueden crear nuevos usuarios
          y asignar roles. Los usuarios necesitan ser asignados a roles para acceder a las funcionalidades.
        </Typography>
      </Paper>

      <GenericTable
        columns={columns}
        data={usuarios}
        title="Usuarios del Sistema"
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchable={true}
        searchKeys={['username', 'nombre_completo', 'email']}
      />

      {/* Diálogo para agregar/editar */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {currentUsuario ? 'Editar Usuario' : 'Agregar Nuevo Usuario'}
          <IconButton
            aria-label="close"
            onClick={() => setOpenDialog(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <GenericForm
            title=""
            fields={getFormFields()}
            initialValues={currentUsuario ? {
              username: currentUsuario.username,
              nombre_completo: currentUsuario.nombre_completo,
              email: currentUsuario.email,
              password: '',
              activo: currentUsuario.activo
            } : initialValues}
            onSubmit={handleSubmit}
            onCancel={() => setOpenDialog(false)}
            submitButtonText={currentUsuario ? 'Actualizar Usuario' : 'Crear Usuario'}
          />
        </DialogContent>
      </Dialog>

      {/* Notificaciones */}
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UsuariosPage;