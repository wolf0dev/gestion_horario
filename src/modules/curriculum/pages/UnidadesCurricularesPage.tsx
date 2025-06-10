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

// Tipo para el modelo de Unidad Curricular
interface UnidadCurricular {
  uc_id: number;
  codigo: string;
  nombre: string;
  creditos: number;
  horas_teoria: number;
  horas_practica: number;
  descripcion: string;
  activa: boolean;
}

// Valores iniciales para una unidad curricular nueva
const initialValues: Omit<UnidadCurricular, 'uc_id'> = {
  codigo: '',
  nombre: '',
  creditos: 0,
  horas_teoria: 0,
  horas_practica: 0,
  descripcion: '',
  activa: true,
};

const UnidadesCurricularesPage = () => {
  const [unidadesCurriculares, setUnidadesCurriculares] = useState<UnidadCurricular[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentUC, setCurrentUC] = useState<UnidadCurricular | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as const });

  // Definición de columnas para la tabla
  const columns: Column<UnidadCurricular>[] = [
    { id: 'codigo', label: 'Código', minWidth: 100, sortable: true },
    { id: 'nombre', label: 'Nombre', minWidth: 200, sortable: true },
    { id: 'creditos', label: 'Créditos', minWidth: 100, align: 'right', sortable: true },
    { id: 'horas_teoria', label: 'Horas Teoría', minWidth: 130, align: 'right', sortable: true },
    { id: 'horas_practica', label: 'Horas Práctica', minWidth: 130, align: 'right', sortable: true },
    { 
      id: 'activa', 
      label: 'Estado', 
      minWidth: 100, 
      sortable: true,
      format: (value: boolean) => value ? 'Activa' : 'Inactiva'
    },
  ];

  // Definición de campos para el formulario
  const formFields: FormField[] = [
    { 
      name: 'codigo', 
      label: 'Código', 
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
      name: 'creditos', 
      label: 'Créditos', 
      type: 'number', 
      required: true,
      xs: 12,
      sm: 4,
    },
    { 
      name: 'horas_teoria', 
      label: 'Horas Teoría', 
      type: 'number', 
      required: true,
      xs: 12,
      sm: 4,
    },
    { 
      name: 'horas_practica', 
      label: 'Horas Práctica', 
      type: 'number', 
      required: true,
      xs: 12,
      sm: 4,
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
      name: 'activa', 
      label: 'Activa', 
      type: 'boolean',
      xs: 12,
    },
  ];

  // Cargar datos
  useEffect(() => {
    const fetchUnidadesCurriculares = async () => {
      try {
        const response = await api.get('/api/unidades-curriculares/todas');
        setUnidadesCurriculares(response.data);
      } catch (error) {
        console.error('Error fetching UCs:', error);
        showSnackbar('Error al cargar unidades curriculares', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchUnidadesCurriculares();
  }, []);

  // Manejar apertura del formulario para agregar
  const handleAdd = () => {
    setCurrentUC(null);
    setOpenDialog(true);
  };

  // Manejar apertura del formulario para editar
  const handleEdit = (uc: UnidadCurricular) => {
    setCurrentUC(uc);
    setOpenDialog(true);
  };

  // Manejar eliminación
  const handleDelete = async (uc: UnidadCurricular) => {
    try {
      await api.delete(`/api/unidades-curriculares/eliminar/${uc.uc_id}`);
      setUnidadesCurriculares(unidadesCurriculares.filter(u => u.uc_id !== uc.uc_id));
      showSnackbar('Unidad curricular eliminada exitosamente', 'success');
    } catch (error) {
      console.error('Error deleting UC:', error);
      showSnackbar('Error al eliminar unidad curricular', 'error');
    }
  };

  // Manejar envío del formulario (agregar o editar)
  const handleSubmit = async (values: any) => {
    try {
      if (currentUC) {
        // Actualizar UC existente
        await api.put('/api/unidades-curriculares/actualizar', {
          ...values,
          uc_id: currentUC.uc_id
        });
        setUnidadesCurriculares(unidadesCurriculares.map(u => 
          u.uc_id === currentUC.uc_id 
            ? { ...values, uc_id: currentUC.uc_id }
            : u
        ));
        showSnackbar('Unidad curricular actualizada exitosamente', 'success');
      } else {
        // Crear nueva UC
        await api.post('/api/unidades-curriculares/registro', values);
        // Recargar la lista para obtener el ID generado
        const response = await api.get('/api/unidades-curriculares/todas');
        setUnidadesCurriculares(response.data);
        showSnackbar('Unidad curricular registrada exitosamente', 'success');
      }
      setOpenDialog(false);
    } catch (error) {
      console.error('Error submitting UC:', error);
      showSnackbar(
        `Error al ${currentUC ? 'actualizar' : 'registrar'} unidad curricular`,
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
        Unidades Curriculares
      </Typography>

      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Typography variant="body1" gutterBottom>
          Administre las unidades curriculares de la institución. Puede agregar nuevas unidades,
          editar la información de las existentes o desactivar aquellas que no estén en uso.
        </Typography>
      </Paper>

      <GenericTable
        columns={columns}
        data={unidadesCurriculares}
        title="Unidades Curriculares"
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchable={true}
        searchKeys={['codigo', 'nombre', 'descripcion']}
      />

      {/* Diálogo para agregar/editar */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {currentUC ? 'Editar Unidad Curricular' : 'Agregar Nueva Unidad Curricular'}
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
            initialValues={currentUC || initialValues}
            onSubmit={handleSubmit}
            onCancel={() => setOpenDialog(false)}
            submitButtonText={currentUC ? 'Actualizar' : 'Guardar'}
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

export default UnidadesCurricularesPage;