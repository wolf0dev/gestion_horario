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

// Tipo para el modelo de Profesor
interface Profesor {
  profesor_id: number;
  cedula: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  especialidad: string;
  activo: boolean;
}

// Valores iniciales para un profesor nuevo
const initialValues: Omit<Profesor, 'profesor_id'> = {
  cedula: '',
  nombre: '',
  apellido: '',
  email: '',
  telefono: '',
  especialidad: '',
  activo: true,
};

const ProfesoresPage = () => {
  const [profesores, setProfesores] = useState<Profesor[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentProfesor, setCurrentProfesor] = useState<Profesor | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as const });

  // Definición de columnas para la tabla
  const columns: Column<Profesor>[] = [
    { id: 'cedula', label: 'Cédula', minWidth: 100, sortable: true },
    { id: 'nombre', label: 'Nombre', minWidth: 150, sortable: true },
    { id: 'apellido', label: 'Apellido', minWidth: 150, sortable: true },
    { id: 'email', label: 'Email', minWidth: 200, sortable: true },
    { id: 'telefono', label: 'Teléfono', minWidth: 120, sortable: false },
    { id: 'especialidad', label: 'Especialidad', minWidth: 150, sortable: true },
    { 
      id: 'activo', 
      label: 'Estado', 
      minWidth: 100, 
      sortable: true,
      format: (value: boolean) => value ? 'Activo' : 'Inactivo'
    },
  ];

  // Definición de campos para el formulario
  const formFields: FormField[] = [
    { 
      name: 'cedula', 
      label: 'Cédula', 
      type: 'text', 
      required: true,
      xs: 12,
      sm: 6,
    },
    { 
      name: 'nombre', 
      label: 'Nombre', 
      type: 'text', 
      required: true,
      xs: 12,
      sm: 6,
    },
    { 
      name: 'apellido', 
      label: 'Apellido', 
      type: 'text', 
      required: true,
      xs: 12,
      sm: 6,
    },
    { 
      name: 'email', 
      label: 'Email', 
      type: 'email', 
      required: true,
      xs: 12,
      sm: 6,
    },
    { 
      name: 'telefono', 
      label: 'Teléfono', 
      type: 'text', 
      required: true,
      xs: 12,
      sm: 6,
    },
    { 
      name: 'especialidad', 
      label: 'Especialidad', 
      type: 'text', 
      required: true,
      xs: 12,
      sm: 6,
    },
    { 
      name: 'activo', 
      label: 'Activo', 
      type: 'boolean',
      xs: 12,
    },
  ];

  // Cargar datos
  useEffect(() => {
    const fetchProfesores = async () => {
      try {
        const response = await api.get('/api/profesores/todos');
        setProfesores(response.data);
      } catch (error) {
        console.error('Error fetching profesores:', error);
        showSnackbar('Error al cargar profesores', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchProfesores();
  }, []);

  // Manejar apertura del formulario para agregar
  const handleAdd = () => {
    setCurrentProfesor(null);
    setOpenDialog(true);
  };

  // Manejar apertura del formulario para editar
  const handleEdit = (profesor: Profesor) => {
    setCurrentProfesor(profesor);
    setOpenDialog(true);
  };

  // Manejar eliminación
  const handleDelete = async (profesor: Profesor) => {
    try {
      await api.delete(`/api/profesores/eliminar/${profesor.profesor_id}`);
      setProfesores(profesores.filter(p => p.profesor_id !== profesor.profesor_id));
      showSnackbar('Profesor eliminado exitosamente', 'success');
    } catch (error) {
      console.error('Error deleting profesor:', error);
      showSnackbar('Error al eliminar profesor', 'error');
    }
  };

  // Manejar envío del formulario (agregar o editar)
  const handleSubmit = async (values: any) => {
    try {
      if (currentProfesor) {
        // Actualizar profesor existente
        await api.put('/api/profesores/actualizar', {
          ...values,
          profesor_id: currentProfesor.profesor_id
        });
        setProfesores(profesores.map(p => 
          p.profesor_id === currentProfesor.profesor_id 
            ? { ...values, profesor_id: currentProfesor.profesor_id }
            : p
        ));
        showSnackbar('Profesor actualizado exitosamente', 'success');
      } else {
        // Crear nuevo profesor
        await api.post('/api/profesores/registro', values);
        // Recargar la lista para obtener el ID generado
        const response = await api.get('/api/profesores/todos');
        setProfesores(response.data);
        showSnackbar('Profesor registrado exitosamente', 'success');
      }
      setOpenDialog(false);
    } catch (error) {
      console.error('Error submitting profesor:', error);
      showSnackbar(
        `Error al ${currentProfesor ? 'actualizar' : 'registrar'} profesor`,
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
        Gestión de Profesores
      </Typography>

      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Typography variant="body1" gutterBottom>
          Administre los profesores de la institución. Puede agregar nuevos profesores,
          editar la información de los existentes o desactivar aquellos que ya no estén disponibles.
        </Typography>
      </Paper>

      <GenericTable
        columns={columns}
        data={profesores}
        title="Profesores"
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchable={true}
        searchKeys={['cedula', 'nombre', 'apellido', 'email', 'especialidad']}
      />

      {/* Diálogo para agregar/editar */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {currentProfesor ? 'Editar Profesor' : 'Agregar Nuevo Profesor'}
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
            initialValues={currentProfesor || initialValues}
            onSubmit={handleSubmit}
            onCancel={() => setOpenDialog(false)}
            submitButtonText={currentProfesor ? 'Actualizar' : 'Guardar'}
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

export default ProfesoresPage;