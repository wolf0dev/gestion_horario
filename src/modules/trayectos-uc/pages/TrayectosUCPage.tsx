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

// Tipo para el modelo de Trayecto UC
interface TrayectoUC {
  trayecto_uc_id: number;
  trayecto_nombre: string;
  uc_nombre: string;
  trayecto_id?: number;
  uc_id?: number;
}

// Tipo para los datos del formulario
interface TrayectoUCForm {
  trayecto_id: string;
  uc_id: string;
}

// Valores iniciales para un trayecto UC nuevo
const initialValues: TrayectoUCForm = {
  trayecto_id: '',
  uc_id: '',
};

const TrayectosUCPage = () => {
  const [trayectosUC, setTrayectosUC] = useState<TrayectoUC[]>([]);
  const [trayectos, setTrayectos] = useState<any[]>([]);
  const [unidadesCurriculares, setUnidadesCurriculares] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentTrayectoUC, setCurrentTrayectoUC] = useState<TrayectoUC | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as const });

  // Definición de columnas para la tabla
  const columns: Column<TrayectoUC>[] = [
    { id: 'trayecto_nombre', label: 'Trayecto', minWidth: 200, sortable: true },
    { id: 'uc_nombre', label: 'Unidad Curricular', minWidth: 250, sortable: true },
  ];

  // Definición de campos para el formulario
  const formFields: FormField[] = [
    { 
      name: 'trayecto_id', 
      label: 'Trayecto', 
      type: 'select', 
      required: true,
      options: trayectos.map(trayecto => ({
        label: trayecto.nombre,
        value: trayecto.trayecto_id.toString()
      })),
      xs: 12,
      sm: 6,
    },
    { 
      name: 'uc_id', 
      label: 'Unidad Curricular', 
      type: 'select', 
      required: true,
      options: unidadesCurriculares.map(uc => ({
        label: `${uc.codigo} - ${uc.nombre}`,
        value: uc.uc_id.toString()
      })),
      xs: 12,
      sm: 6,
    },
  ];

  // Cargar datos
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [trayectosUCRes, trayectosRes, ucRes] = await Promise.all([
          api.get('/api/trayectos-uc/vista'),
          api.get('/api/trayectos/todos'),
          api.get('/api/unidades-curriculares/todas')
        ]);
        
        setTrayectosUC(trayectosUCRes.data);
        setTrayectos(trayectosRes.data);
        setUnidadesCurriculares(ucRes.data);
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
    setCurrentTrayectoUC(null);
    setOpenDialog(true);
  };

  // Manejar apertura del formulario para editar
  const handleEdit = (trayectoUC: TrayectoUC) => {
    setCurrentTrayectoUC(trayectoUC);
    setOpenDialog(true);
  };

  // Manejar eliminación
  const handleDelete = async (trayectoUC: TrayectoUC) => {
    try {
      await api.delete(`/api/trayectos-uc/eliminar/${trayectoUC.trayecto_uc_id}`);
      setTrayectosUC(trayectosUC.filter(tuc => tuc.trayecto_uc_id !== trayectoUC.trayecto_uc_id));
      showSnackbar('Asignación eliminada exitosamente', 'success');
    } catch (error) {
      console.error('Error deleting trayecto UC:', error);
      showSnackbar('Error al eliminar asignación', 'error');
    }
  };

  // Manejar envío del formulario (agregar o editar)
  const handleSubmit = async (values: TrayectoUCForm) => {
    try {
      // Convertir valores de string a number para la API
      const formattedValues = {
        trayecto_id: Number(values.trayecto_id),
        uc_id: Number(values.uc_id),
      };

      if (currentTrayectoUC) {
        // Actualizar trayecto UC existente
        await api.put('/api/trayectos-uc/actualizar', {
          ...formattedValues,
          trayecto_uc_id: currentTrayectoUC.trayecto_uc_id
        });
        // Recargar la lista
        const response = await api.get('/api/trayectos-uc/vista');
        setTrayectosUC(response.data);
        showSnackbar('Asignación actualizada exitosamente', 'success');
      } else {
        // Crear nuevo trayecto UC
        await api.post('/api/trayectos-uc/registro', formattedValues);
        // Recargar la lista
        const response = await api.get('/api/trayectos-uc/vista');
        setTrayectosUC(response.data);
        showSnackbar('Asignación registrada exitosamente', 'success');
      }
      setOpenDialog(false);
    } catch (error) {
      console.error('Error submitting trayecto UC:', error);
      showSnackbar(
        `Error al ${currentTrayectoUC ? 'actualizar' : 'registrar'} asignación`,
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
        Unidades Curriculares por Trayecto
      </Typography>

      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Typography variant="body1" gutterBottom>
          Administre la asignación de unidades curriculares a los trayectos académicos.
          Defina qué materias pertenecen a cada nivel de estudio.
        </Typography>
      </Paper>

      <GenericTable
        columns={columns}
        data={trayectosUC}
        title="Trayectos y Unidades Curriculares"
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchable={true}
        searchKeys={['trayecto_nombre', 'uc_nombre']}
      />

      {/* Diálogo para agregar/editar */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {currentTrayectoUC ? 'Editar Asignación' : 'Asignar Unidad Curricular a Trayecto'}
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
            initialValues={currentTrayectoUC ? {
              trayecto_id: currentTrayectoUC.trayecto_id?.toString() || '',
              uc_id: currentTrayectoUC.uc_id?.toString() || '',
            } : initialValues}
            onSubmit={handleSubmit}
            onCancel={() => setOpenDialog(false)}
            submitButtonText={currentTrayectoUC ? 'Actualizar' : 'Asignar'}
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

export default TrayectosUCPage;