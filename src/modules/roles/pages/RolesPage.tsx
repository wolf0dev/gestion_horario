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

// Tipo para el modelo de Rol
interface Rol {
  rol_id: number;
  nombre_rol: string;
  descripcion: string;
}

// Valores iniciales para un rol nuevo
const initialValues: Omit<Rol, 'rol_id'> = {
  nombre_rol: '',
  descripcion: '',
};

const RolesPage = () => {
  const [roles, setRoles] = useState<Rol[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentRol, setCurrentRol] = useState<Rol | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as const });

  // Definición de columnas para la tabla
  const columns: Column<Rol>[] = [
    { id: 'nombre_rol', label: 'Nombre', minWidth: 150, sortable: true },
    { id: 'descripcion', label: 'Descripción', minWidth: 300, sortable: true },
  ];

  // Definición de campos para el formulario
  const formFields: FormField[] = [
    { 
      name: 'nombre_rol', 
      label: 'Nombre del Rol', 
      type: 'text', 
      required: true,
      xs: 12,
      sm: 6,
    },
    { 
      name: 'descripcion', 
      label: 'Descripción', 
      type: 'textarea', 
      multiline: true,
      rows: 3,
      xs: 12,
    },
  ];

  // Cargar datos
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await api.get('/api/roles/todos');
        setRoles(response.data);
      } catch (error) {
        console.error('Error fetching roles:', error);
        showSnackbar('Error al cargar roles', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, []);

  // Manejar apertura del formulario para agregar
  const handleAdd = () => {
    setCurrentRol(null);
    setOpenDialog(true);
  };

  // Manejar apertura del formulario para editar
  const handleEdit = (rol: Rol) => {
    setCurrentRol(rol);
    setOpenDialog(true);
  };

  // Manejar eliminación
  const handleDelete = async (rol: Rol) => {
    try {
      await api.delete(`/api/roles/eliminar/${rol.rol_id}`);
      setRoles(roles.filter(r => r.rol_id !== rol.rol_id));
      showSnackbar('Rol eliminado exitosamente', 'success');
    } catch (error) {
      console.error('Error deleting rol:', error);
      showSnackbar('Error al eliminar rol', 'error');
    }
  };

  // Manejar envío del formulario (agregar o editar)
  const handleSubmit = async (values: any) => {
    try {
      if (currentRol) {
        // Actualizar rol existente
        await api.put('/api/roles/actualizar', {
          ...values,
          rol_id: currentRol.rol_id
        });
        setRoles(roles.map(r => 
          r.rol_id === currentRol.rol_id 
            ? { ...values, rol_id: currentRol.rol_id }
            : r
        ));
        showSnackbar('Rol actualizado exitosamente', 'success');
      } else {
        // Crear nuevo rol
        const response = await api.post('/api/roles/registro', values);
        const newRol = response.data;
        setRoles([...roles, newRol]);
        showSnackbar('Rol registrado exitosamente', 'success');
      }
      setOpenDialog(false);
    } catch (error) {
      console.error('Error submitting rol:', error);
      showSnackbar(
        `Error al ${currentRol ? 'actualizar' : 'registrar'} rol`,
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
        Gestión de Roles
      </Typography>

      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Typography variant="body1" gutterBottom>
          Administre los roles del sistema. Los roles definen los permisos y accesos
          que tendrán los usuarios en la aplicación.
        </Typography>
      </Paper>

      <GenericTable
        columns={columns}
        data={roles}
        title="Roles"
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchable={true}
        searchKeys={['nombre_rol', 'descripcion']}
      />

      {/* Diálogo para agregar/editar */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {currentRol ? 'Editar Rol' : 'Agregar Nuevo Rol'}
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
            initialValues={currentRol || initialValues}
            onSubmit={handleSubmit}
            onCancel={() => setOpenDialog(false)}
            submitButtonText={currentRol ? 'Actualizar' : 'Guardar'}
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

export default RolesPage;