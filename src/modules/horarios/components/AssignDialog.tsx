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
  useTheme,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from '@mui/material';
import { X as CloseIcon, Plus as PlusIcon } from 'lucide-react';
import { Field } from 'formik';
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

// Paleta de colores predefinidos con buen contraste
const colorPalette = [
  { name: 'Azul Principal', value: '#1976d2' },
  { name: 'Rosa', value: '#f50057' },
  { name: 'Naranja', value: '#ff9800' },
  { name: 'Verde', value: '#4caf50' },
  { name: 'Púrpura', value: '#9c27b0' },
  { name: 'Cian', value: '#00bcd4' },
  { name: 'Rojo', value: '#f44336' },
  { name: 'Índigo', value: '#3f51b5' },
  { name: 'Teal', value: '#009688' },
  { name: 'Ámbar', value: '#ffc107' },
  { name: 'Marrón', value: '#795548' },
  { name: 'Gris Azul', value: '#607d8b' },
  { name: 'Lima', value: '#8bc34a' },
  { name: 'Rosa Profundo', value: '#e91e63' },
  { name: 'Azul Profundo', value: '#2196f3' },
  { name: 'Verde Claro', value: '#cddc39' },
];

// Componente personalizado para el selector de colores
const ColorPicker = ({ name, value, onChange, error, helperText }: any) => {
  return (
    <FormControl fullWidth margin="normal" error={error}>
      <InputLabel id={`${name}-label`}>Color</InputLabel>
      <Select
        labelId={`${name}-label`}
        value={value}
        onChange={onChange}
        label="Color"
        name={name}
        renderValue={(selected) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 20,
                height: 20,
                backgroundColor: selected,
                borderRadius: '50%',
                border: '2px solid #fff',
                boxShadow: '0 0 0 1px rgba(0,0,0,0.1)',
              }}
            />
            <Typography variant="body2">
              {colorPalette.find(c => c.value === selected)?.name || 'Color personalizado'}
            </Typography>
          </Box>
        )}
      >
        {colorPalette.map((color) => (
          <MenuItem key={color.value} value={color.value}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  backgroundColor: color.value,
                  borderRadius: '50%',
                  border: '2px solid #fff',
                  boxShadow: '0 0 0 1px rgba(0,0,0,0.1)',
                  flexShrink: 0,
                }}
              />
              <Box>
                <Typography variant="body2" fontWeight="medium">
                  {color.name}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {color.value}
                </Typography>
              </Box>
            </Box>
          </MenuItem>
        ))}
      </Select>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

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

  useEffect(() => {
  }, [trayectos, trayectosUC, tabValue]);

  const initialValues = {
    trayecto_uc_id: '',
    dia_id: selectedCell?.dia || '',
    bloque_id: selectedCell?.bloque || '',
    aula_id: '',
    profesor_id: profesores[tabValue]?.profesor_id || '',
    trayecto_id: '',
    color: '#1976d2',
    activo: true,
  };

  const formFields: FormField[] = [
    {
      name: 'trayecto_id',
      label: 'Trayecto',
      type: 'select',
      required: true,
      options: trayectos.map(trayecto => ({
        label: trayecto.nombre,
        value: trayecto.trayecto_id
      })),
      xs: 12,
      sm: 6,
    },
    {
      name: 'trayecto_uc_id',
      label: 'Unidad Curricular',
      type: 'select',
      required: true,
      options: trayectosUC.map(tuc => ({
        label: `${tuc.uc_codigo || ''} - ${tuc.uc_nombre}`,
        value: tuc.trayecto_uc_id
      })),
      xs: 12,
      sm: 6,
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
    },
  ];

  const handleSubmit = (values: any) => {
    const formattedValues = {
      ...values,
      trayecto_uc_id: Number(values.trayecto_uc_id),
      dia_id: selectedCell?.dia || Number(values.dia_id),
      bloque_id: selectedCell?.bloque || Number(values.bloque_id),
      aula_id: Number(values.aula_id),
      profesor_id: profesores[tabValue]?.profesor_id || Number(values.profesor_id),
      trayecto_id: Number(values.trayecto_id),
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
                <Typography variant="body2" color="textSecondary">Profesor:</Typography>
                <Typography variant="body1" fontWeight="bold">
                  {profesores[tabValue] ? `${profesores[tabValue].nombre} ${profesores[tabValue].apellido}` : 'No seleccionado'}
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

        <GenericForm
          title=""
          fields={formFields}
          initialValues={initialValues}
          onSubmit={handleSubmit}
          onCancel={onClose}
          submitButtonText="Asignar Clase"
          customFields={{
            color: (field: any, formikProps: any) => (
              <Field name="color">
                {({ field: formikField, meta }: any) => (
                  <ColorPicker
                    name="color"
                    value={formikField.value}
                    onChange={formikField.onChange}
                    error={meta.touched && meta.error ? true : false}
                    helperText={meta.touched && meta.error ? meta.error : ''}
                  />
                )}
              </Field>
            )
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AssignDialog;