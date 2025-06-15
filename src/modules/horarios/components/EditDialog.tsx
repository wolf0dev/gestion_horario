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
import { X as CloseIcon, Edit as EditIcon } from 'lucide-react';
import { Field } from 'formik';
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
  trayecto_id: number;
  color?: string;
  activo: boolean;
}

interface EditDialogProps {
  open: boolean;
  onClose: () => void;
  currentHorario: Horario | null;
  trayectos: any[];
  trayectosUC: any[];
  aulas: any[];
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

const EditDialog = ({
  open,
  onClose,
  currentHorario,
  trayectos,
  trayectosUC,
  aulas,
  onSubmit,
}: EditDialogProps) => {
  const theme = useTheme();

  useEffect(() => {
    console.log('Current Horario:', currentHorario);
    console.log('Trayectos:', trayectos);
    console.log('TrayectosUC:', trayectosUC);
  }, [currentHorario, trayectos, trayectosUC]);

  // Verificar si currentHorario es null o undefined
  const initialValues = currentHorario ? {
    horario_id: currentHorario.horario_id,
    trayecto_id: currentHorario.trayecto_id?.toString() || '',
    trayecto_uc_id: currentHorario.trayecto_uc_id?.toString() || '',
    aula_id: currentHorario.aula_id?.toString() || '',
    color: currentHorario.color || '#1976d2',
    activo: currentHorario.activo !== undefined ? currentHorario.activo : true,
  } : {
    horario_id: '',
    trayecto_id: '',
    trayecto_uc_id: '',
    aula_id: '',
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
        value: trayecto.trayecto_id?.toString() || ''
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
        label: `${tuc.uc_codigo || ''} - ${tuc.uc_nombre || ''}`,
        value: tuc.trayecto_uc_id?.toString() || ''
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
        label: `${aula.codigo_aula || ''} - ${aula.tipo_aula || ''} (Cap: ${aula.capacidad || ''})`,
        value: aula.aula_id?.toString() || ''
      })),
      xs: 12,
    },
  ];

  const handleSubmit = (values: any) => {
    // NO enviar dia_id y bloque_id - mantener los originales del horario
    // NO enviar profesor_id - mantener el original del horario
    const formattedValues = {
      horario_id: Number(values.horario_id),
      trayecto_id: Number(values.trayecto_id),
      trayecto_uc_id: Number(values.trayecto_uc_id),
      aula_id: Number(values.aula_id),
      color: values.color,
      activo: values.activo,
    };
    
    console.log('Sending formatted values (sin dia_id, bloque_id y profesor_id):', formattedValues);
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
                <Typography variant="body2" color="textSecondary">Profesor:</Typography>
                <Typography variant="body1" fontWeight="bold">
                  {currentHorario.profesor_nombre || 'No especificado'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">Trayecto:</Typography>
                <Typography variant="body1" fontWeight="bold">
                  {currentHorario.trayecto_nombre || 'No especificado'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">Unidad Curricular:</Typography>
                <Typography variant="body1" fontWeight="bold">
                  {currentHorario.uc_nombre || 'No especificado'}
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
                      width: 24, 
                      height: 24, 
                      backgroundColor: currentHorario.color || '#1976d2',
                      borderRadius: '50%',
                      border: '2px solid #fff',
                      boxShadow: '0 0 0 1px rgba(0,0,0,0.1)',
                    }} 
                  />
                  <Typography variant="body1" fontWeight="bold">
                    {colorPalette.find(c => c.value === currentHorario.color)?.name || currentHorario.color || '#1976d2'}
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

export default EditDialog;