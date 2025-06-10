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

// Tipo para el modelo de Usuario Rol
interface UsuarioRol {
  usuario_rol_id: number;
  usuario_nombre: string;
  rol_nombre: string;
  usuario_id?: number;
  rol_id?: number;
}

// Tipo para los datos del formulario
interface UsuarioRolForm {
  usuario_id: string;
  rol_id: string;
}

// Valores iniciales para un usuario rol nuevo
const initialValues: UsuarioRolForm = {
  usuario_id: '',
  rol_id: '',
};

const UsuariosRolesPage = () => {
  const [usuariosRoles, setUsuariosRoles] = useState<UsuarioRol[]>([]);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentUsuarioRol, setCurrentUsuarioRol] = useState<UsuarioRol | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as const });

  // Definición de columnas para la tabla
  const columns: Column<UsuarioRol>[] = [
    { id: 'usuario_nombre', label: 'Usuario', minWidth: 200, sortable: true },
    { id: 'rol_nombre', label: 'Rol', minWidth: 200, sortable: true },
  ];

  // Definición de campos para el formulario
  const formFields: FormField[] = [
    { 
      name: 'usuario_id', 
      label: 'Usuario', 
      type: 'select', 
      required: true,
      options: usuarios.map(usuario => ({
        label: usuario.username,
        value: usuario.usuario_id.toString()
      })),
      xs: 12,
      sm: 6,
    },
    { 
      name: 'rol_id', 
      label: 'Rol', 
      type: 'select', 
      required: true,
      options: roles.map(rol => ({
        label: rol.nombre_rol,
        value: rol.rol_id.toString()
      })),
      xs: 12,
      sm: 6,
    },
  ];

  // Cargar datos
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usuariosRolesRes, usuariosRes, rolesRes] = await Promise.all([
          api.get('/api/usuarios-roles/vista'),
          api.get('/api/usuarios/todos'),
          api.get('/api/roles/todos')
        ]);
        
        setUsuariosRoles(usuariosRolesRes.data);
        setUsuarios(usuariosRes.data);
        setRoles(rolesRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        showSnackbar('Error al cargar datos', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Manejar apertura del formulario para agregar
  const handleAdd = () => {
    setCurrentUsuarioRol(null);
    setOpenDialog(true);
  };

  // Manejar apertura del formulario para editar
  const handleEdit = (usuarioRol: UsuarioRol) => {
    setCurrentUsuarioRol(usuarioRol);
    setOpenDialog(true);
  };

  // Manejar eliminación
  const handleDelete = async (usuarioRol: UsuarioRol) => {
    try {
      await api.delete(`/api/usuarios-roles/eliminar/${usuarioRol.usuario_rol_id}`);
      setUsuariosRoles(usuariosRoles.filter(ur => ur.usuario_rol_id !== usuarioRol.usuario_rol_id));
      showSnackbar('Asignación de rol eliminada exitosamente', 'success');
    } catch (error) {
      console.error('Error deleting usuario rol:', error);
      showSnackbar('Error al eliminar asignación de rol', 'error');
    }
  };

  // Manejar envío del formulario (agregar o editar)
  const handleSubmit = async (values: UsuarioRolForm) => {
    try {
      // Convertir valores de string a number para la API
      const formattedValues = {
        usuario_id: Number(values.usuario_id),
        rol_id: Number(values.rol_id),
      };

      if (currentUsuarioRol) {
        // Actualizar usuario rol existente
        await api.put('/api/usuarios-roles/actualizar', {
          ...formattedValues,
          usuario_rol_id: currentUsuarioRol.usuario_rol_id
        });
        // Recargar la lista
        const response = await api.get('/api/usuarios-roles/vista');
        setUsuariosRoles(response.data);
        showSnackbar('Asignación de rol actualizada exitosamente', 'success');
      } else {
        // Crear nuevo usuario rol
        await api.post('/api/usuarios-roles/registro', formattedValues);
        // Recargar la lista
        const response = await api.get('/api/usuarios-roles/vista');
        setUsuariosRoles(response.data);
        showSnackbar('Asignación de rol registrada exitosamente', 'success');
      }
      setOpenDialog(false);
    } catch (error) {
      console.error('Error submitting usuario rol:', error);
      showSnackbar(
        `Error al ${currentUsuarioRol ? 'actualizar' : 'registrar'} asignación de rol`,
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
        Asignación de Roles a Usuarios
      </Typography>

      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Typography variant="body1" gutterBottom>
          Administre la asignación de roles a los usuarios del sistema. Puede asignar diferentes
          roles a cada usuario para controlar sus permisos y accesos.
        </Typography>
      </Paper>

      <GenericTable
        columns={columns}
        data={usuariosRoles}
        title="Usuarios y Roles"
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchable={true}
        searchKeys={['usuario_nombre', 'rol_nombre']}
      />

      {/* Diálogo para agregar/editar */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {currentUsuarioRol ? 'Editar Asignación de Rol' : 'Asignar Rol a Usuario'}
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
            fields={formFields}
            initialValues={currentUsuarioRol ? {
              usuario_id: currentUsuarioRol.usuario_id?.toString() || '',
              rol_id: currentUsuarioRol.rol_id?.toString() || '',
            } : initialValues}
            onSubmit={handleSubmit}
            onCancel={() => setOpenDialog(false)}
            submitButtonText={currentUsuarioRol ? 'Actualizar' : 'Asignar'}
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

export default UsuariosRolesPage;