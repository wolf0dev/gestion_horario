import React, { useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Grid,
  Paper,
  useTheme
} from '@mui/material';
import { X as CloseIcon, Edit as EditIcon } from 'lucide-react';
import GenericForm, { FormField } from '../../../components/generic/GenericForm';

interface Horario {
  horario_id: number;
  trayecto_nombre: string;
  uc_nombre: string;
  profesor_nombre: string;
  aula_nombre: string;
  dia_nombre: string;
  bloque_nombre: string;
  trayecto_uc_id: number;
  dia_id: number;
  bloque_id: number;
  aula_id: number;
  profesor_id: number;
  color?: string;
  activo: boolean;
}

interface EditDialogProps {
  open: boolean;
  onClose: () => void;
  currentHorario: Horario | null;
  trayectosUC: any[];
  aulas: any[];
  profesores: any[];
  onSubmit: (values: any) => void;
}

const EditDialog = ({
  open,
  onClose,
  currentHorario,
  trayectosUC,
  aulas,
  profesores,
  onSubmit,
}: EditDialogProps) => {
  const theme = useTheme();

  // Filtrar UCs por el trayecto del horario actual
  const filteredTrayectosUC = currentHorario 
    ? trayectosUC.filter(tuc => tuc.trayecto_nombre === currentHorario.trayecto_nombre)
    : trayectosUC;

  useEffect(() => {
  }, [currentHorario, trayectosUC, filteredTrayectosUC]);

  // Verificar si currentHorario es null o undefined
  const initialValues = currentHorario ? {
    horario_id: currentHorario.horario_id,
    trayecto_uc_id: currentHorario.trayecto_uc_id?.toString() || '',
    dia_id: currentHorario.dia_id?.toString() || '',
    bloque_id: currentHorario.bloque_id?.toString() || '',
    aula_id: currentHorario.aula_id?.toString() || '',
    profesor_id: currentHorario.profesor_id?.toString() || '',
    color: currentHorario.color || '#1976d2',
    activo: currentHorario.activo !== undefined ? currentHorario.activo : true,
  } : {
    horario_id: '',
    trayecto_uc_id: '',
    dia_id: '',
    bloque_id: '',
    aula_id: '',
    profesor_id: '',
    color: '#1976d2',
    activo: true,
  };

  const formFields: FormField[] = [
    {
      name: 'trayecto_uc_id',
      label: 'Unidad Curricular',
      type: 'select',
      required: true,
      options: filteredTrayectosUC.map(tuc => ({
        label: `${tuc.uc_codigo || ''} - ${tuc.uc_nombre || ''}`,
        value: tuc.trayecto_uc_id?.toString() || ''
      })),
      xs: 12,
    },
    {
      name: 'aula_id',
      label: 'Aula',
      type: 'select',
      required: true,
      options: aulas.map(aula => ({
        label: `${aula.codigo_aula || ''} - ${aula.tipo_aula || ''} (Cap: ${aula.capacidad || ''})`,
        value: aula.aula_id?.toString() || ''
      })),
      xs: 12,
      sm: 6,
    },
    {
      name: 'profesor_id',
      label: 'Profesor',
      type: 'select',
      required: true,
      options: profesores.map(profesor => ({
        label: `${profesor.nombre || ''} ${profesor.apellido || ''} - ${profesor.especialidad || ''}`,
        value: profesor.profesor_id?.toString() || ''
      })),
      xs: 12,
      sm: 6,
    },
    {
      name: 'color',
      label: 'Color',
      type: 'text',
      required: true,
      placeholder: '#1976d2',
      xs: 12,
      sm: 6,
    },
  ];

  const handleSubmit = (values: any) => {
    const formattedValues = {
      ...values,
      horario_id: Number(values.horario_id),
      trayecto_uc_id: Number(values.trayecto_uc_id),
      dia_id: Number(values.dia_id),
      bloque_id: Number(values.bloque_id),
      aula_id: Number(values.aula_id),
      profesor_id: Number(values.profesor_id),
    };
    onSubmit(formattedValues);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle sx={{ bgcolor: theme.palette.warning.main, color: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EditIcon size={24} />
          Editar Clase Asignada
        </Box>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: 'white',
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        {currentHorario && (
          <Paper sx={{ p: 2, mb: 3, bgcolor: theme.palette.grey[50] }}>
            <Typography variant="h6" gutterBottom>
              Clase actual:
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">Unidad Curricular:</Typography>
                <Typography variant="body1" fontWeight="bold">
                  {currentHorario.uc_nombre || 'No especificado'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">Profesor:</Typography>
                <Typography variant="body1" fontWeight="bold">
                  {currentHorario.profesor_nombre || 'No especificado'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">Aula:</Typography>
                <Typography variant="body1" fontWeight="bold">
                  {currentHorario.aula_nombre || 'No especificado'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">Horario:</Typography>
                <Typography variant="body1" fontWeight="bold">
                  {currentHorario.dia_nombre || 'No especificado'} - {currentHorario.bloque_nombre || 'No especificado'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">Color actual:</Typography>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1 
                }}>
                  <Box 
                    sx={{ 
                      width: 20, 
                      height: 20, 
                      backgroundColor: currentHorario.color || '#1976d2',
                      borderRadius: 1,
                      border: '1px solid #ccc'
                    }} 
                  />
                  <Typography variant="body1" fontWeight="bold">
                    {currentHorario.color || '#1976d2'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        )}
        <GenericForm
          title=""
          fields={formFields}
          initialValues={initialValues}
          onSubmit={handleSubmit}
          onCancel={onClose}
          submitButtonText="Actualizar Clase"
        />
      </DialogContent>
    </Dialog>
  );
};

export default EditDialog;