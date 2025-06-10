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

// Tipo para el modelo de Bloque Horario
interface BloqueHorario {
  bloque_id: number;
  nombre_bloque: string;
  hora_inicio: string;
  hora_fin: string;
  descripcion: string;
  activo: boolean;
}

// Valores iniciales para un bloque horario nuevo
const initialValues: Omit<BloqueHorario, 'bloque_id'> = {
  nombre_bloque: '',
  hora_inicio: '',
  hora_fin: '',
  descripcion: '',
  activo: true,
};

const BloquesHorariosPage = () => {
  const [bloquesHorarios, setBloquesHorarios] = useState<BloqueHorario[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentBloque, setCurrentBloque] = useState<BloqueHorario | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as const });

  // Definición de columnas para la tabla
  const columns: Column<BloqueHorario>[] = [
    { id: 'nombre_bloque', label: 'Nombre', minWidth: 150, sortable: true },
    { id: 'hora_inicio', label: 'Hora Inicio', minWidth: 120, sortable: true },
    { id: 'hora_fin', label: 'Hora Fin', minWidth: 120, sortable: true },
    { id: 'descripcion', label: 'Descripción', minWidth: 200, sortable: true },
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
      name: 'nombre_bloque', 
      label: 'Nombre del Bloque', 
      type: 'text', 
      required: true,
      xs: 12,
      sm: 6,
    },
    { 
      name: 'hora_inicio', 
      label: 'Hora de Inicio', 
      type: 'time', 
      required: true,
      xs: 12,
      sm: 6,
    },
    { 
      name: 'hora_fin', 
      label: 'Hora de Fin', 
      type: 'time', 
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
    const fetchBloquesHorarios = async () => {
      try {
        const response = await api.get('/api/bloques-horarios/todos');
        setBloquesHorarios(response.data);
      } catch (error) {
        console.error('Error fetching bloques horarios:', error);
        showSnackbar('Error al cargar bloques horarios', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchBloquesHorarios();
  }, []);

  // Manejar apertura del formulario para agregar
  const handleAdd = () => {
    setCurrentBloque(null);
    setOpenDialog(true);
  };

  // Manejar apertura del formulario para editar
  const handleEdit = (bloque: BloqueHorario) => {
    setCurrentBloque(bloque);
    setOpenDialog(true);
  };

  // Manejar eliminación
  const handleDelete = async (bloque: BloqueHorario) => {
    try {
      await api.delete(`/api/bloques-horarios/eliminar/${bloque.bloque_id}`);
      setBloquesHorarios(bloquesHorarios.filter(b => b.bloque_id !== bloque.bloque_id));
      showSnackbar('Bloque horario eliminado exitosamente', 'success');
    } catch (error) {
      console.error('Error deleting bloque horario:', error);
      showSnackbar('Error al eliminar bloque horario', 'error');
    }
  };

  // Manejar envío del formulario (agregar o editar)
  const handleSubmit = async (values: any) => {
    try {
      // Formatear las horas para incluir segundos
      const formattedValues = {
        ...values,
        hora_inicio: values.hora_inicio + ':00',
        hora_fin: values.hora_fin + ':00',
      };

      if (currentBloque) {
        // Actualizar bloque existente
        await api.put('/api/bloques-horarios/actualizar', {
          ...formattedValues,
          bloque_id: currentBloque.bloque_id
        });
        setBloquesHorarios(bloquesHorarios.map(b => 
          b.bloque_id === currentBloque.bloque_id 
            ? { ...formattedValues, bloque_id: currentBloque.bloque_id }
            : b
        ));
        showSnackbar('Bloque horario actualizado exitosamente', 'success');
      } else {
        // Crear nuevo bloque
        await api.post('/api/bloques-horarios/registro', formattedValues);
        // Recargar la lista para obtener el ID generado
        const response = await api.get('/api/bloques-horarios/todos');
        setBloquesHorarios(response.data);
        showSnackbar('Bloque horario registrado exitosamente', 'success');
      }
      setOpenDialog(false);
    } catch (error) {
      console.error('Error submitting bloque horario:', error);
      showSnackbar(
        `Error al ${currentBloque ? 'actualizar' : 'registrar'} bloque horario`,
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
        Bloques Horarios
      </Typography>

      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Typography variant="body1" gutterBottom>
          Administre los bloques horarios de la institución. Los bloques definen los períodos
          de tiempo en los que se pueden programar las clases.
        </Typography>
      </Paper>

      <GenericTable
        columns={columns}
        data={bloquesHorarios}
        title="Bloques Horarios"
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchable={true}
        searchKeys={['nombre_bloque', 'descripcion']}
      />

      {/* Diálogo para agregar/editar */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {currentBloque ? 'Editar Bloque Horario' : 'Agregar Nuevo Bloque Horario'}
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
            initialValues={currentBloque ? {
              ...currentBloque,
              hora_inicio: currentBloque.hora_inicio.substring(0, 5),
              hora_fin: currentBloque.hora_fin.substring(0, 5),
            } : initialValues}
            onSubmit={handleSubmit}
            onCancel={() => setOpenDialog(false)}
            submitButtonText={currentBloque ? 'Actualizar' : 'Guardar'}
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

export default BloquesHorariosPage;