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

// Tipo para el modelo de Rol Permiso
interface RolPermiso {
  rol_permiso_id: number;
  rol_nombre: string;
  permiso_nombre: string;
  rol_id?: number;
  permiso_id?: number;
}

// Tipo para los datos del formulario
interface RolPermisoForm {
  rol_id: string;
  permiso_id: string;
}

// Valores iniciales para un rol permiso nuevo
const initialValues: RolPermisoForm = {
  rol_id: '',
  permiso_id: '',
};

const RolesPermisosPage = () => {
  const [rolesPermisos, setRolesPermisos] = useState<RolPermiso[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [permisos, setPermisos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentRolPermiso, setCurrentRolPermiso] = useState<RolPermiso | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as const });

  // Definición de columnas para la tabla
  const columns: Column<RolPermiso>[] = [
    { id: 'rol_nombre', label: 'Rol', minWidth: 200, sortable: true },
    { id: 'permiso_nombre', label: 'Permiso', minWidth: 200, sortable: true },
  ];

  // Definición de campos para el formulario
  const formFields: FormField[] = [
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
    { 
      name: 'permiso_id', 
      label: 'Permiso', 
      type: 'select', 
      required: true,
      options: permisos.map(permiso => ({
        label: permiso.nombre_permiso,
        value: permiso.permiso_id.toString()
      })),
      xs: 12,
      sm: 6,
    },
  ];

  // Cargar datos
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rolesPermisosRes, rolesRes, permisosRes] = await Promise.all([
          api.get('/api/roles-permisos/vista'),
          api.get('/api/roles/todos'),
          api.get('/api/permisos/todos')
        ]);
        
        setRolesPermisos(rolesPermisosRes.data);
        setRoles(rolesRes.data);
        setPermisos(permisosRes.data);
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
    setCurrentRolPermiso(null);
    setOpenDialog(true);
  };

  // Manejar apertura del formulario para editar
  const handleEdit = (rolPermiso: RolPermiso) => {
    setCurrentRolPermiso(rolPermiso);
    setOpenDialog(true);
  };

  // Manejar eliminación
  const handleDelete = async (rolPermiso: RolPermiso) => {
    try {
      await api.delete(`/api/roles-permisos/eliminar/${rolPermiso.rol_permiso_id}`);
      setRolesPermisos(rolesPermisos.filter(rp => rp.rol_permiso_id !== rolPermiso.rol_permiso_id));
      showSnackbar('Permiso de rol eliminado exitosamente', 'success');
    } catch (error) {
      console.error('Error deleting rol permiso:', error);
      showSnackbar('Error al eliminar permiso de rol', 'error');
    }
  };

  // Manejar envío del formulario (agregar o editar)
  const handleSubmit = async (values: RolPermisoForm) => {
    try {
      // Convertir valores de string a number para la API
      const formattedValues = {
        rol_id: Number(values.rol_id),
        permiso_id: Number(values.permiso_id),
      };

      if (currentRolPermiso) {
        // Actualizar rol permiso existente
        await api.put('/api/roles-permisos/actualizar', {
          ...formattedValues,
          rol_permiso_id: currentRolPermiso.rol_permiso_id
        });
        // Recargar la lista
        const response = await api.get('/api/roles-permisos/vista');
        setRolesPermisos(response.data);
        showSnackbar('Permiso de rol actualizado exitosamente', 'success');
      } else {
        // Crear nuevo rol permiso
        await api.post('/api/roles-permisos/registro', formattedValues);
        // Recargar la lista
        const response = await api.get('/api/roles-permisos/vista');
        setRolesPermisos(response.data);
        showSnackbar('Permiso de rol registrado exitosamente', 'success');
      }
      setOpenDialog(false);
    } catch (error) {
      console.error('Error submitting rol permiso:', error);
      showSnackbar(
        `Error al ${currentRolPermiso ? 'actualizar' : 'registrar'} permiso de rol`,
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
        Permisos por Rol
      </Typography>

      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Typography variant="body1" gutterBottom>
          Administre los permisos asignados a cada rol del sistema. Defina qué acciones
          puede realizar cada rol dentro de la aplicación.
        </Typography>
      </Paper>

      <GenericTable
        columns={columns}
        data={rolesPermisos}
        title="Roles y Permisos"
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchable={true}
        searchKeys={['rol_nombre', 'permiso_nombre']}
      />

      {/* Diálogo para agregar/editar */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {currentRolPermiso ? 'Editar Permiso de Rol' : 'Asignar Permiso a Rol'}
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
            initialValues={currentRolPermiso ? {
              rol_id: currentRolPermiso.rol_id?.toString() || '',
              permiso_id: currentRolPermiso.permiso_id?.toString() || '',
            } : initialValues}
            onSubmit={handleSubmit}
            onCancel={() => setOpenDialog(false)}
            submitButtonText={currentRolPermiso ? 'Actualizar' : 'Asignar'}
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

export default RolesPermisosPage;