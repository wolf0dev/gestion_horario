import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Snackbar,
  Alert,
  Paper,
} from '@mui/material';

// Components
import AulasTable from '../components/AulasTable';
import AulaForm from '../components/AulaForm';
import api from '../../../services/api';

// Tipo para el modelo de Aula
interface Aula {
  aula_id: number;
  codigo_aula: string;
  capacidad: number;
  tipo_aula: string;
  ubicacion: string;
  descripcion: string;
  activa: boolean;
}

const AulasPage = () => {
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentAula, setCurrentAula] = useState<Aula | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as const });

  // Cargar datos
  useEffect(() => {
    const fetchAulas = async () => {
      try {
        const response = await api.get('/api/aulas/todas');
        setAulas(response.data);
      } catch (error) {
        console.error('Error fetching aulas:', error);
        showSnackbar('Error al cargar aulas', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchAulas();
  }, []);

  // Manejar apertura del formulario para agregar
  const handleAdd = () => {
    setCurrentAula(null);
    setOpenDialog(true);
  };

  // Manejar apertura del formulario para editar
  const handleEdit = (aula: Aula) => {
    setCurrentAula(aula);
    setOpenDialog(true);
  };

  // Manejar eliminación
  const handleDelete = async (aula: Aula) => {
    try {
      await api.delete(`/api/aulas/eliminar/${aula.aula_id}`);
      setAulas(aulas.filter(a => a.aula_id !== aula.aula_id));
      showSnackbar('Aula eliminada exitosamente', 'success');
    } catch (error) {
      console.error('Error deleting aula:', error);
      showSnackbar('Error al eliminar aula', 'error');
    }
  };

  // Manejar envío del formulario (agregar o editar)
  const handleSubmit = async (values: any) => {
    try {
      if (currentAula) {
        // Actualizar aula existente
        await api.put('/api/aulas/actualizar', {
          ...values,
          aula_id: currentAula.aula_id
        });
        setAulas(aulas.map(a => 
          a.aula_id === currentAula.aula_id 
            ? { ...values, aula_id: currentAula.aula_id }
            : a
        ));
        showSnackbar('Aula actualizada exitosamente', 'success');
      } else {
        // Crear nueva aula
        await api.post('/api/aulas/registro', values);
        // Recargar la lista para obtener el ID generado
        const response = await api.get('/api/aulas/todas');
        setAulas(response.data);
        showSnackbar('Aula registrada exitosamente', 'success');
      }
      setOpenDialog(false);
    } catch (error) {
      console.error('Error submitting aula:', error);
      showSnackbar(
        `Error al ${currentAula ? 'actualizar' : 'registrar'} aula`,
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
        Gestión de Aulas
      </Typography>

      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Typography variant="body1" gutterBottom>
          Administre las aulas disponibles en la institución. Puede agregar nuevas aulas,
          editar la información de las existentes o desactivar aquellas que no estén en uso.
        </Typography>
      </Paper>

      <AulasTable
        aulas={aulas}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <AulaForm
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        currentAula={currentAula}
        onSubmit={handleSubmit}
      />

      {/* Notificaciones */}
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AulasPage;