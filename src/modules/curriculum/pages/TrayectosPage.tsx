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

// Tipo para el modelo de Trayecto
interface Trayecto {
  trayecto_id: number;
  nombre: string;
  descripcion: string;
  activo: boolean;
}

// Valores iniciales para un trayecto nuevo
const initialValues: Omit<Trayecto, 'trayecto_id'> = {
  nombre: '',
  descripcion: '',
  activo: true,
};

const TrayectosPage = () => {
  const [trayectos, setTrayectos] = useState<Trayecto[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentTrayecto, setCurrentTrayecto] = useState<Trayecto | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as const });

  // Definición de columnas para la tabla
  const columns: Column<Trayecto>[] = [
    { id: 'nombre', label: 'Nombre', minWidth: 150, sortable: true },
    { id: 'descripcion', label: 'Descripción', minWidth: 300, sortable: true },
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
      name: 'nombre', 
      label: 'Nombre', 
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
    { 
      name: 'activo', 
      label: 'Activo', 
      type: 'boolean',
      xs: 12,
    },
  ];

  // Cargar datos
  useEffect(() => {
    const fetchTrayectos = async () => {
      try {
        const response = await api.get('/api/trayectos/todos');
        setTrayectos(response.data);
      } catch (error) {
        console.error('Error fetching trayectos:', error);
        showSnackbar('Error al cargar trayectos', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchTrayectos();
  }, []);

  // Manejar apertura del formulario para agregar
  const handleAdd = () => {
    setCurrentTrayecto(null);
    setOpenDialog(true);
  };

  // Manejar apertura del formulario para editar
  const handleEdit = (trayecto: Trayecto) => {
    setCurrentTrayecto(trayecto);
    setOpenDialog(true);
  };

  // Manejar eliminación
  const handleDelete = async (trayecto: Trayecto) => {
    try {
      await api.delete(`/api/trayectos/eliminar/${trayecto.trayecto_id}`);
      setTrayectos(trayectos.filter(t => t.trayecto_id !== trayecto.trayecto_id));
      showSnackbar('Trayecto eliminado exitosamente', 'success');
    } catch (error) {
      console.error('Error deleting trayecto:', error);
      showSnackbar('Error al eliminar trayecto', 'error');
    }
  };

  // Manejar envío del formulario (agregar o editar)
  const handleSubmit = async (values: any) => {
    try {
      if (currentTrayecto) {
        // Actualizar trayecto existente
        await api.put('/api/trayectos/actualizar', {
          ...values,
          trayecto_id: currentTrayecto.trayecto_id
        });
        setTrayectos(trayectos.map(t => 
          t.trayecto_id === currentTrayecto.trayecto_id 
            ? { ...values, trayecto_id: currentTrayecto.trayecto_id }
            : t
        ));
        showSnackbar('Trayecto actualizado exitosamente', 'success');
      } else {
        // Crear nuevo trayecto
        await api.post('/api/trayectos/registro', values);
        // Recargar la lista para obtener el ID generado
        const response = await api.get('/api/trayectos/todos');
        setTrayectos(response.data);
        showSnackbar('Trayecto registrado exitosamente', 'success');
      }
      setOpenDialog(false);
    } catch (error) {
      console.error('Error submitting trayecto:', error);
      showSnackbar(
        `Error al ${currentTrayecto ? 'actualizar' : 'registrar'} trayecto`,
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
        Trayectos
      </Typography>

      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Typography variant="body1" gutterBottom>
          Administre los trayectos académicos de la institución. Los trayectos representan los niveles
          de estudio y contienen las unidades curriculares correspondientes.
        </Typography>
      </Paper>

      <GenericTable
        columns={columns}
        data={trayectos}
        title="Trayectos"
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchable={true}
        searchKeys={['nombre', 'descripcion']}
      />

      {/* Diálogo para agregar/editar */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {currentTrayecto ? 'Editar Trayecto' : 'Agregar Nuevo Trayecto'}
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
            initialValues={currentTrayecto || initialValues}
            onSubmit={handleSubmit}
            onCancel={() => setOpenDialog(false)}
            submitButtonText={currentTrayecto ? 'Actualizar' : 'Guardar'}
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

export default TrayectosPage;