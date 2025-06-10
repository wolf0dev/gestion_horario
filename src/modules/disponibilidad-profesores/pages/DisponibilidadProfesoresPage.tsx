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

// Tipo para el modelo de Disponibilidad Profesor
interface DisponibilidadProfesor {
  disponibilidad_profesor_id: number;
  profesor_nombre: string;
  dia_nombre: string;
  bloque_nombre: string;
  profesor_id?: number;
  dia_id?: number;
  bloque_id?: number;
}

// Tipo para los datos del formulario
interface DisponibilidadProfesorForm {
  profesor_id: string;
  dia_id: string;
  bloque_id: string;
}

// Valores iniciales para una disponibilidad nueva
const initialValues: DisponibilidadProfesorForm = {
  profesor_id: '',
  dia_id: '',
  bloque_id: '',
};

const DisponibilidadProfesoresPage = () => {
  const [disponibilidades, setDisponibilidades] = useState<DisponibilidadProfesor[]>([]);
  const [profesores, setProfesores] = useState<any[]>([]);
  const [dias, setDias] = useState<any[]>([]);
  const [bloques, setBloques] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentDisponibilidad, setCurrentDisponibilidad] = useState<DisponibilidadProfesor | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as const });

  // Definición de columnas para la tabla
  const columns: Column<DisponibilidadProfesor>[] = [
    { id: 'profesor_nombre', label: 'Profesor', minWidth: 200, sortable: true },
    { id: 'dia_nombre', label: 'Día', minWidth: 120, sortable: true },
    { id: 'bloque_nombre', label: 'Bloque Horario', minWidth: 150, sortable: true },
  ];

  // Definición de campos para el formulario
  const formFields: FormField[] = [
    { 
      name: 'profesor_id', 
      label: 'Profesor', 
      type: 'select', 
      required: true,
      options: profesores.map(profesor => ({
        label: `${profesor.nombre} ${profesor.apellido}`,
        value: profesor.profesor_id.toString()
      })),
      xs: 12,
      sm: 4,
    },
    { 
      name: 'dia_id', 
      label: 'Día', 
      type: 'select', 
      required: true,
      options: dias.map(dia => ({
        label: dia.nombre_dia,
        value: dia.dia_id.toString()
      })),
      xs: 12,
      sm: 4,
    },
    { 
      name: 'bloque_id', 
      label: 'Bloque Horario', 
      type: 'select', 
      required: true,
      options: bloques.map(bloque => ({
        label: `${bloque.nombre_bloque} (${bloque.hora_inicio} - ${bloque.hora_fin})`,
        value: bloque.bloque_id.toString()
      })),
      xs: 12,
      sm: 4,
    },
  ];

  // Cargar datos
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [disponibilidadesRes, profesoresRes, diasRes, bloquesRes] = await Promise.all([
          api.get('/api/disponibilidad-profesores/vista'),
          api.get('/api/profesores/todos'),
          api.get('/api/dias-semana/todos'),
          api.get('/api/bloques-horarios/todos')
        ]);
        
        setDisponibilidades(disponibilidadesRes.data);
        setProfesores(profesoresRes.data);
        setDias(diasRes.data);
        setBloques(bloquesRes.data);
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
    setCurrentDisponibilidad(null);
    setOpenDialog(true);
  };

  // Manejar apertura del formulario para editar
  const handleEdit = (disponibilidad: DisponibilidadProfesor) => {
    setCurrentDisponibilidad(disponibilidad);
    setOpenDialog(true);
  };

  // Manejar eliminación
  const handleDelete = async (disponibilidad: DisponibilidadProfesor) => {
    try {
      await api.delete(`/api/disponibilidad-profesores/eliminar/${disponibilidad.disponibilidad_profesor_id}`);
      setDisponibilidades(disponibilidades.filter(d => d.disponibilidad_profesor_id !== disponibilidad.disponibilidad_profesor_id));
      showSnackbar('Disponibilidad eliminada exitosamente', 'success');
    } catch (error) {
      console.error('Error deleting disponibilidad:', error);
      showSnackbar('Error al eliminar disponibilidad', 'error');
    }
  };

  // Manejar envío del formulario (agregar o editar)
  const handleSubmit = async (values: DisponibilidadProfesorForm) => {
    try {
      // Convertir valores de string a number para la API
      const formattedValues = {
        profesor_id: Number(values.profesor_id),
        dia_id: Number(values.dia_id),
        bloque_id: Number(values.bloque_id),
      };

      if (currentDisponibilidad) {
        // Actualizar disponibilidad existente
        await api.put('/api/disponibilidad-profesores/actualizar', {
          ...formattedValues,
          disponibilidad_profesor_id: currentDisponibilidad.disponibilidad_profesor_id
        });
        // Recargar la lista
        const response = await api.get('/api/disponibilidad-profesores/vista');
        setDisponibilidades(response.data);
        showSnackbar('Disponibilidad actualizada exitosamente', 'success');
      } else {
        // Crear nueva disponibilidad
        await api.post('/api/disponibilidad-profesores/registro', formattedValues);
        // Recargar la lista
        const response = await api.get('/api/disponibilidad-profesores/vista');
        setDisponibilidades(response.data);
        showSnackbar('Disponibilidad registrada exitosamente', 'success');
      }
      setOpenDialog(false);
    } catch (error) {
      console.error('Error submitting disponibilidad:', error);
      showSnackbar(
        `Error al ${currentDisponibilidad ? 'actualizar' : 'registrar'} disponibilidad`,
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
        Disponibilidad de Profesores
      </Typography>

      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Typography variant="body1" gutterBottom>
          Administre la disponibilidad horaria de los profesores. Defina en qué días y bloques
          horarios cada profesor está disponible para dictar clases.
        </Typography>
      </Paper>

      <GenericTable
        columns={columns}
        data={disponibilidades}
        title="Disponibilidad de Profesores"
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchable={true}
        searchKeys={['profesor_nombre', 'dia_nombre', 'bloque_nombre']}
      />

      {/* Diálogo para agregar/editar */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {currentDisponibilidad ? 'Editar Disponibilidad' : 'Registrar Disponibilidad de Profesor'}
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
            initialValues={currentDisponibilidad ? {
              profesor_id: currentDisponibilidad.profesor_id?.toString() || '',
              dia_id: currentDisponibilidad.dia_id?.toString() || '',
              bloque_id: currentDisponibilidad.bloque_id?.toString() || '',
            } : initialValues}
            onSubmit={handleSubmit}
            onCancel={() => setOpenDialog(false)}
            submitButtonText={currentDisponibilidad ? 'Actualizar' : 'Registrar'}
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

export default DisponibilidadProfesoresPage;