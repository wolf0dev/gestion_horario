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

// Tipo para el modelo de Día de la Semana
interface DiaSemana {
  dia_id: number;
  nombre_dia: string;
  abreviacion: string;
}

// Valores iniciales para un día de la semana nuevo
const initialValues: Omit<DiaSemana, 'dia_id'> = {
  nombre_dia: '',
  abreviacion: '',
};

const DiasSemanaPage = () => {
  const [diasSemana, setDiasSemana] = useState<DiaSemana[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentDia, setCurrentDia] = useState<DiaSemana | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as const });

  // Definición de columnas para la tabla
  const columns: Column<DiaSemana>[] = [
    { id: 'nombre_dia', label: 'Nombre', minWidth: 150, sortable: true },
    { id: 'abreviacion', label: 'Abreviación', minWidth: 120, sortable: true },
  ];

  // Definición de campos para el formulario
  const formFields: FormField[] = [
    { 
      name: 'nombre_dia', 
      label: 'Nombre del Día', 
      type: 'text', 
      required: true,
      xs: 12,
      sm: 6,
    },
    { 
      name: 'abreviacion', 
      label: 'Abreviación', 
      type: 'text', 
      required: true,
      xs: 12,
      sm: 6,
    },
  ];

  // Cargar datos
  useEffect(() => {
    const fetchDiasSemana = async () => {
      try {
        const response = await api.get('/api/dias-semana/todos');
        setDiasSemana(response.data);
      } catch (error) {
        console.error('Error fetching días semana:', error);
        showSnackbar('Error al cargar días de la semana', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchDiasSemana();
  }, []);

  // Manejar apertura del formulario para agregar
  const handleAdd = () => {
    setCurrentDia(null);
    setOpenDialog(true);
  };

  // Manejar apertura del formulario para editar
  const handleEdit = (dia: DiaSemana) => {
    setCurrentDia(dia);
    setOpenDialog(true);
  };

  // Manejar eliminación
  const handleDelete = async (dia: DiaSemana) => {
    try {
      await api.delete(`/api/dias-semana/eliminar/${dia.dia_id}`);
      setDiasSemana(diasSemana.filter(d => d.dia_id !== dia.dia_id));
      showSnackbar('Día de la semana eliminado exitosamente', 'success');
    } catch (error) {
      console.error('Error deleting día semana:', error);
      showSnackbar('Error al eliminar día de la semana', 'error');
    }
  };

  // Manejar envío del formulario (agregar o editar)
  const handleSubmit = async (values: any) => {
    try {
      if (currentDia) {
        // Actualizar día existente
        await api.put('/api/dias-semana/actualizar', {
          ...values,
          dia_id: currentDia.dia_id
        });
        setDiasSemana(diasSemana.map(d => 
          d.dia_id === currentDia.dia_id 
            ? { ...values, dia_id: currentDia.dia_id }
            : d
        ));
        showSnackbar('Día de la semana actualizado exitosamente', 'success');
      } else {
        // Crear nuevo día
        await api.post('/api/dias-semana/registro', values);
        // Recargar la lista para obtener el ID generado
        const response = await api.get('/api/dias-semana/todos');
        setDiasSemana(response.data);
        showSnackbar('Día de la semana registrado exitosamente', 'success');
      }
      setOpenDialog(false);
    } catch (error) {
      console.error('Error submitting día semana:', error);
      showSnackbar(
        `Error al ${currentDia ? 'actualizar' : 'registrar'} día de la semana`,
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
        Días de la Semana
      </Typography>

      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Typography variant="body1" gutterBottom>
          Administre los días de la semana utilizados en el sistema de horarios.
          Estos días se utilizan para programar las clases y actividades académicas.
        </Typography>
      </Paper>

      <GenericTable
        columns={columns}
        data={diasSemana}
        title="Días de la Semana"
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchable={true}
        searchKeys={['nombre_dia', 'abreviacion']}
      />

      {/* Diálogo para agregar/editar */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {currentDia ? 'Editar Día de la Semana' : 'Agregar Nuevo Día de la Semana'}
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
            initialValues={currentDia || initialValues}
            onSubmit={handleSubmit}
            onCancel={() => setOpenDialog(false)}
            submitButtonText={currentDia ? 'Actualizar' : 'Guardar'}
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

export default DiasSemanaPage;