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

// Tipo para el modelo de Disponibilidad Aula
interface DisponibilidadAula {
  disponibilidad_aula_id: number;
  aula_nombre: string;
  dia_nombre: string;
  bloque_nombre: string;
  aula_id?: number;
  dia_id?: number;
  bloque_id?: number;
}

// Tipo para los datos del formulario
interface DisponibilidadAulaForm {
  aula_id: string;
  dia_id: string;
  bloque_id: string;
}

// Valores iniciales para una disponibilidad nueva
const initialValues: DisponibilidadAulaForm = {
  aula_id: '',
  dia_id: '',
  bloque_id: '',
};

const DisponibilidadAulasPage = () => {
  const [disponibilidades, setDisponibilidades] = useState<DisponibilidadAula[]>([]);
  const [aulas, setAulas] = useState<any[]>([]);
  const [dias, setDias] = useState<any[]>([]);
  const [bloques, setBloques] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentDisponibilidad, setCurrentDisponibilidad] = useState<DisponibilidadAula | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as const });

  // Definición de columnas para la tabla
  const columns: Column<DisponibilidadAula>[] = [
    { id: 'aula_nombre', label: 'Aula', minWidth: 150, sortable: true },
    { id: 'dia_nombre', label: 'Día', minWidth: 120, sortable: true },
    { id: 'bloque_nombre', label: 'Bloque Horario', minWidth: 150, sortable: true },
  ];

  // Definición de campos para el formulario
  const formFields: FormField[] = [
    { 
      name: 'aula_id', 
      label: 'Aula', 
      type: 'select', 
      required: true,
      options: aulas.map(aula => ({
        label: `${aula.codigo_aula} - ${aula.tipo_aula}`,
        value: aula.aula_id.toString()
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
        const [disponibilidadesRes, aulasRes, diasRes, bloquesRes] = await Promise.all([
          api.get('/api/disponibilidad-aulas/vista'),
          api.get('/api/aulas/todas'),
          api.get('/api/dias-semana/todos'),
          api.get('/api/bloques-horarios/todos')
        ]);
        
        console.log('Disponibilidades cargadas:', disponibilidadesRes.data);
        setDisponibilidades(disponibilidadesRes.data);
        setAulas(aulasRes.data);
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
  const handleEdit = (disponibilidad: DisponibilidadAula) => {
    console.log('Editando disponibilidad:', disponibilidad);
    setCurrentDisponibilidad(disponibilidad);
    setOpenDialog(true);
  };

  // Manejar eliminación
  const handleDelete = async (disponibilidad: DisponibilidadAula) => {
    try {
      console.log('Eliminando disponibilidad con ID:', disponibilidad.disponibilidad_aula_id);
      await api.delete(`/api/disponibilidad-aulas/eliminar/${disponibilidad.disponibilidad_aula_id}`);
      setDisponibilidades(disponibilidades.filter(d => d.disponibilidad_aula_id !== disponibilidad.disponibilidad_aula_id));
      showSnackbar('Disponibilidad eliminada exitosamente', 'success');
    } catch (error) {
      console.error('Error deleting disponibilidad:', error);
      showSnackbar('Error al eliminar disponibilidad', 'error');
    }
  };

  // Función para obtener IDs a partir de nombres
  const getIdFromName = (name: string, array: any[], nameField: string, idField: string): number | null => {
    const item = array.find(item => item[nameField] === name);
    return item ? item[idField] : null;
  };

  // Manejar envío del formulario (agregar o editar)
  const handleSubmit = async (values: DisponibilidadAulaForm) => {
    try {
      // Convertir valores de string a number para la API
      const formattedValues = {
        aula_id: Number(values.aula_id),
        dia_id: Number(values.dia_id),
        bloque_id: Number(values.bloque_id),
      };

      console.log('Enviando datos:', formattedValues);

      if (currentDisponibilidad) {
        // Actualizar disponibilidad existente
        const updateData = {
          ...formattedValues,
          disponibilidad_aula_id: currentDisponibilidad.disponibilidad_aula_id
        };
        
        console.log('Actualizando con datos:', updateData);
        await api.put('/api/disponibilidad-aulas/actualizar', updateData);
        
        // Recargar la lista
        const response = await api.get('/api/disponibilidad-aulas/vista');
        setDisponibilidades(response.data);
        showSnackbar('Disponibilidad actualizada exitosamente', 'success');
      } else {
        // Crear nueva disponibilidad
        await api.post('/api/disponibilidad-aulas/registro', formattedValues);
        
        // Recargar la lista
        const response = await api.get('/api/disponibilidad-aulas/vista');
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
        Disponibilidad de Aulas
      </Typography>

      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Typography variant="body1" gutterBottom>
          Administre la disponibilidad de las aulas. Defina en qué días y bloques
          horarios cada aula está disponible para ser asignada a clases.
        </Typography>
      </Paper>

      <GenericTable
        columns={columns}
        data={disponibilidades}
        title="Disponibilidad de Aulas"
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchable={true}
        searchKeys={['aula_nombre', 'dia_nombre', 'bloque_nombre']}
      />

      {/* Diálogo para agregar/editar */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {currentDisponibilidad ? 'Editar Disponibilidad' : 'Registrar Disponibilidad de Aula'}
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
              aula_id: currentDisponibilidad.aula_id?.toString() || 
                       getIdFromName(currentDisponibilidad.aula_nombre, aulas, 'codigo_aula', 'aula_id')?.toString() || '',
              dia_id: currentDisponibilidad.dia_id?.toString() || 
                      getIdFromName(currentDisponibilidad.dia_nombre, dias, 'nombre_dia', 'dia_id')?.toString() || '',
              bloque_id: currentDisponibilidad.bloque_id?.toString() || 
                         getIdFromName(currentDisponibilidad.bloque_nombre, bloques, 'nombre_bloque', 'bloque_id')?.toString() || '',
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

export default DisponibilidadAulasPage;