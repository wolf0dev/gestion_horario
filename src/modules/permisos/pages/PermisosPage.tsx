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

// Tipo para el modelo de Permiso
interface Permiso {
  permiso_id: number;
  nombre_permiso: string;
  descripcion: string;
}

// Valores iniciales para un permiso nuevo
const initialValues: Omit<Permiso, 'permiso_id'> = {
  nombre_permiso: '',
  descripcion: '',
};

const PermisosPage = () => {
  const [permisos, setPermisos] = useState<Permiso[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentPermiso, setCurrentPermiso] = useState<Permiso | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as const });

  // Definición de columnas para la tabla
  const columns: Column<Permiso>[] = [
    { id: 'nombre_permiso', label: 'Nombre', minWidth: 150, sortable: true },
    { id: 'descripcion', label: 'Descripción', minWidth: 300, sortable: true },
  ];

  // Definición de campos para el formulario
  const formFields: FormField[] = [
    { 
      name: 'nombre_permiso', 
      label: 'Nombre del Permiso', 
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
    const fetchPermisos = async () => {
      try {
        const response = await api.get('/api/permisos/todos');
        setPermisos(response.data);
      } catch (error) {
        console.error('Error fetching permisos:', error);
        showSnackbar('Error al cargar permisos', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchPermisos();
  }, []);

  // Manejar apertura del formulario para agregar
  const handleAdd = () => {
    setCurrentPermiso(null);
    setOpenDialog(true);
  };

  // Manejar apertura del formulario para editar
  const handleEdit = (permiso: Permiso) => {
    setCurrentPermiso(permiso);
    setOpenDialog(true);
  };

  // Manejar eliminación
  const handleDelete = async (permiso: Permiso) => {
    try {
      await api.delete(`/api/permisos/eliminar/${permiso.permiso_id}`);
      setPermisos(permisos.filter(p => p.permiso_id !== permiso.permiso_id));
      showSnackbar('Permiso eliminado exitosamente', 'success');
    } catch (error) {
      console.error('Error deleting permiso:', error);
      showSnackbar('Error al eliminar permiso', 'error');
    }
  };

  // Manejar envío del formulario (agregar o editar)
  const handleSubmit = async (values: any) => {
    try {
      if (currentPermiso) {
        // Actualizar permiso existente
        await api.put('/api/permisos/actualizar', {
          ...values,
          permiso_id: currentPermiso.permiso_id
        });
        setPermisos(permisos.map(p => 
          p.permiso_id === currentPermiso.permiso_id 
            ? { ...values, permiso_id: currentPermiso.permiso_id }
            : p
        ));
        showSnackbar('Permiso actualizado exitosamente', 'success');
      } else {
        // Crear nuevo permiso
        const response = await api.post('/api/permisos/registro', values);
        const newPermiso = response.data;
        setPermisos([...permisos, newPermiso]);
        showSnackbar('Permiso registrado exitosamente', 'success');
      }
      setOpenDialog(false);
    } catch (error) {
      console.error('Error submitting permiso:', error);
      showSnackbar(
        `Error al ${currentPermiso ? 'actualizar' : 'registrar'} permiso`,
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
        Gestión de Permisos
      </Typography>

      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Typography variant="body1" gutterBottom>
          Administre los permisos del sistema. Los permisos definen las acciones específicas
          que pueden realizar los roles dentro de la aplicación.
        </Typography>
      </Paper>

      <GenericTable
        columns={columns}
        data={permisos}
        title="Permisos"
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchable={true}
        searchKeys={['nombre_permiso', 'descripcion']}
      />

      {/* Diálogo para agregar/editar */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {currentPermiso ? 'Editar Permiso' : 'Agregar Nuevo Permiso'}
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
            initialValues={currentPermiso || initialValues}
            onSubmit={handleSubmit}
            onCancel={() => setOpenDialog(false)}
            submitButtonText={currentPermiso ? 'Actualizar' : 'Guardar'}
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

export default PermisosPage;