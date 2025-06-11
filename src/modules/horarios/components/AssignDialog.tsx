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
import { X as CloseIcon, Plus as PlusIcon } from 'lucide-react';
import GenericForm, { FormField } from '../../../components/generic/GenericForm';

interface AssignDialogProps {
  open: boolean;
  onClose: () => void;
  selectedCell: { dia: number; bloque: number } | null;
  trayectos: any[];
  trayectosUC: any[];
  diasSemana: any[];
  bloquesHorarios: any[];
  aulas: any[];
  profesores: any[];
  tabValue: number;
  onSubmit: (values: any) => void;
}

const AssignDialog = ({
  open,
  onClose,
  selectedCell,
  trayectos,
  trayectosUC,
  diasSemana,
  bloquesHorarios,
  aulas,
  profesores,
  tabValue,
  onSubmit,
}: AssignDialogProps) => {
  const theme = useTheme();

  // Filtrar UCs por trayecto seleccionado
  const filteredTrayectosUC = trayectosUC.filter(tuc =>
    trayectos[tabValue] && tuc.trayecto_nombre === trayectos[tabValue].nombre
  );

  useEffect(() => {
  }, [trayectos, trayectosUC, tabValue, filteredTrayectosUC]);

  const initialValues = {
    trayecto_uc_id: '',
    dia_id: selectedCell?.dia || '',
    bloque_id: selectedCell?.bloque || '',
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
        label: `${tuc.trayecto_nombre} - ${tuc.uc_nombre}`,
        value: tuc.trayecto_uc_id
      })),
      xs: 12,
    },
    {
      name: 'aula_id',
      label: 'Aula',
      type: 'select',
      required: true,
      options: aulas.map(aula => ({
        label: `${aula.codigo_aula} - ${aula.tipo_aula} (Cap: ${aula.capacidad})`,
        value: aula.aula_id
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
        label: `${profesor.nombre} ${profesor.apellido} - ${profesor.especialidad}`,
        value: profesor.profesor_id
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
      trayecto_uc_id: Number(values.trayecto_uc_id),
      dia_id: selectedCell?.dia || Number(values.dia_id),
      bloque_id: selectedCell?.bloque || Number(values.bloque_id),
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
      <DialogTitle sx={{ bgcolor: theme.palette.primary.main, color: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PlusIcon size={24} />
          Asignar Nueva Clase
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
        {selectedCell && (
          <Paper sx={{ p: 2, mb: 3, bgcolor: theme.palette.grey[50] }}>
            <Typography variant="h6" gutterBottom>
              Información de la asignación:
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" color="textSecondary">Trayecto:</Typography>
                <Typography variant="body1" fontWeight="bold">
                  {trayectos[tabValue]?.nombre}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" color="textSecondary">Día:</Typography>
                <Typography variant="body1" fontWeight="bold">
                  {diasSemana.find(d => d.dia_id === selectedCell.dia)?.nombre_dia}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" color="textSecondary">Bloque:</Typography>
                <Typography variant="body1" fontWeight="bold">
                  {bloquesHorarios.find(b => b.bloque_id === selectedCell.bloque)?.nombre_bloque}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        )}

        {filteredTrayectosUC.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center', bgcolor: theme.palette.warning.light }}>
            <Typography variant="h6" color="warning.dark" gutterBottom>
              No hay unidades curriculares disponibles
            </Typography>
            <Typography variant="body1" color="warning.dark">
              No se encontraron unidades curriculares asignadas a este trayecto.
              Por favor, asigne unidades curriculares al trayecto primero.
            </Typography>
          </Paper>
        ) : (
          <GenericForm
            title=""
            fields={formFields}
            initialValues={initialValues}
            onSubmit={handleSubmit}
            onCancel={onClose}
            submitButtonText="Asignar Clase"
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AssignDialog;