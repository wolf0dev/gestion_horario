import React, { useEffect, useState } from 'react';
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
  Alert,
} from '@mui/material';
import { X as CloseIcon, Plus as PlusIcon } from 'lucide-react';
import { Field } from 'formik';
import GenericForm, { FormField } from '../../../components/generic/GenericForm';
import api from '../../../services/api';

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
  const [filteredTrayectosUC, setFilteredTrayectosUC] = useState<any[]>([]);
  const [selectedTrayecto, setSelectedTrayecto] = useState<string>('');
  const [availableAulas, setAvailableAulas] = useState<any[]>([]);
  const [loadingAulas, setLoadingAulas] = useState(false);
  const [aulaError, setAulaError] = useState<string>('');
  const [profesorDisponible, setProfesorDisponible] = useState<boolean>(true);
  const [loadingProfesor, setLoadingProfesor] = useState(false);
  const [profesorError, setProfesorError] = useState<string>('');

  // Verificar disponibilidad del profesor cuando se abre el diálogo
  useEffect(() => {
    const checkProfesorAvailability = async () => {
      if (!selectedCell || !profesores[tabValue]) return;

      setLoadingProfesor(true);
      setProfesorError('');
      
      try {
        const profesorActual = profesores[tabValue];
        const diaSeleccionado = diasSemana.find(d => d.dia_id === selectedCell.dia);
        const bloqueSeleccionado = bloquesHorarios.find(b => b.bloque_id === selectedCell.bloque);

        if (!diaSeleccionado || !bloqueSeleccionado) {
          setProfesorError('Error al verificar disponibilidad del profesor.');
          setProfesorDisponible(false);
          return;
        }

        console.log('Verificando disponibilidad del profesor:', {
          profesor: `${profesorActual.nombre} ${profesorActual.apellido}`,
          dia: diaSeleccionado.nombre_dia,
          bloque: bloqueSeleccionado.nombre_bloque
        });

        // Obtener disponibilidad de profesores
        const response = await api.get('/api/disponibilidad-profesores/vista');
        const disponibilidades = response.data;

        // Buscar si el profesor está disponible para este día y bloque
        const profesorNombreCompleto = `${profesorActual.nombre} ${profesorActual.apellido}`;
        const disponibilidad = disponibilidades.find((disp: any) => {
          return disp.profesor_nombre === profesorNombreCompleto &&
                 disp.dia_nombre === diaSeleccionado.nombre_dia &&
                 disp.bloque_nombre === bloqueSeleccionado.nombre_bloque &&
                 disp.disponible === true; // Solo disponibilidades activas
        });

        console.log('Disponibilidad encontrada:', disponibilidad);

        if (!disponibilidad) {
          setProfesorError(`El profesor ${profesorNombreCompleto} no está disponible para ${diaSeleccionado.nombre_dia} en el bloque ${bloqueSeleccionado.nombre_bloque}.`);
          setProfesorDisponible(false);
        } else {
          setProfesorDisponible(true);
          console.log('✅ Profesor disponible');
        }
      } catch (error) {
        console.error('Error checking profesor availability:', error);
        setProfesorError('Error al verificar disponibilidad del profesor.');
        setProfesorDisponible(false);
      } finally {
        setLoadingProfesor(false);
      }
    };

    if (open && selectedCell && profesores[tabValue]) {
      checkProfesorAvailability();
    }
  }, [selectedCell, open, profesores, tabValue, diasSemana, bloquesHorarios]);

  // Cargar aulas disponibles cuando se selecciona día y bloque
  useEffect(() => {
    const loadAvailableAulas = async () => {
      if (!selectedCell) return;

      setLoadingAulas(true);
      setAulaError('');
      
      try {
        const diaSeleccionado = diasSemana.find(d => d.dia_id === selectedCell.dia);
        const bloqueSeleccionado = bloquesHorarios.find(b => b.bloque_id === selectedCell.bloque);

        if (!diaSeleccionado || !bloqueSeleccionado) {
          setAulaError('Error al cargar información del día y bloque.');
          return;
        }

        console.log('Cargando aulas disponibles para:', {
          dia: diaSeleccionado.nombre_dia,
          bloque: bloqueSeleccionado.nombre_bloque
        });

        // Obtener disponibilidad de aulas para el día y bloque específico
        const response = await api.get('/api/disponibilidad-aulas/vista');
        const disponibilidades = response.data;

        // Filtrar aulas disponibles para este día y bloque
        const aulasDisponibles = disponibilidades
          .filter((disp: any) => {
            const diaMatch = disp.dia_nombre === diaSeleccionado.nombre_dia;
            const bloqueMatch = disp.bloque_nombre === bloqueSeleccionado.nombre_bloque;
            const disponibleMatch = disp.disponible === true; // Solo aulas disponibles
            
            console.log(`Verificando aula ${disp.aula_nombre}:`, {
              diaMatch,
              bloqueMatch,
              disponibleMatch,
              disponible: disp.disponible
            });
            
            return diaMatch && bloqueMatch && disponibleMatch;
          })
          .map((disp: any) => {
            // Encontrar el aula completa con todos sus datos
            return aulas.find(aula => 
              aula.codigo_aula === disp.aula_nombre || 
              aula.aula_id.toString() === disp.aula_nombre
            );
          })
          .filter(Boolean); // Eliminar valores undefined

        console.log('Aulas disponibles encontradas:', aulasDisponibles);
        setAvailableAulas(aulasDisponibles);

        if (aulasDisponibles.length === 0) {
          setAulaError('No hay aulas disponibles para este día y bloque horario.');
        }
      } catch (error) {
        console.error('Error loading available aulas:', error);
        setAulaError('Error al cargar aulas disponibles.');
        setAvailableAulas([]);
      } finally {
        setLoadingAulas(false);
      }
    };

    if (open && selectedCell) {
      loadAvailableAulas();
    }
  }, [selectedCell, open, diasSemana, bloquesHorarios, aulas]);

  // Filtrar unidades curriculares por trayecto
  useEffect(() => {
    if (selectedTrayecto) {
      const filtered = trayectosUC.filter(tuc => 
        tuc.trayecto_id?.toString() === selectedTrayecto
      );
      setFilteredTrayectosUC(filtered);
    } else {
      setFilteredTrayectosUC(trayectosUC);
    }
  }, [selectedTrayecto, trayectosUC]);

  const initialValues = {
    trayecto_uc_id: '',
    dia_id: selectedCell?.dia || '',
    bloque_id: selectedCell?.bloque || '',
    aula_id: '',
    profesor_id: profesores[tabValue]?.profesor_id || '',
    color: '#1976d2',
    activo: true,
  };

  const formFields: FormField[] = [
    {
      name: 'trayecto_filter',
      label: 'Filtrar por Trayecto (opcional)',
      type: 'select',
      required: false,
      options: [
        { label: 'Todos los trayectos', value: '' },
        ...trayectos.map(trayecto => ({
          label: trayecto.nombre,
          value: trayecto.trayecto_id?.toString() || ''
        }))
      ],
      xs: 12,
    },
    {
      name: 'trayecto_uc_id',
      label: 'Unidad Curricular',
      type: 'select',
      required: true,
      options: filteredTrayectosUC.map(tuc => ({
        label: `${tuc.trayecto_nombre || ''} - ${tuc.uc_codigo || ''} - ${tuc.uc_nombre || ''}`,
        value: tuc.trayecto_uc_id?.toString() || ''
      })),
      xs: 12,
      disabled: !profesorDisponible,
    },
    {
      name: 'aula_id',
      label: 'Aula Disponible',
      type: 'select',
      required: true,
      options: availableAulas.map(aula => ({
        label: `${aula.codigo_aula} - ${aula.tipo_aula} (Cap: ${aula.capacidad})`,
        value: aula.aula_id?.toString() || ''
      })),
      xs: 12,
      disabled: loadingAulas || availableAulas.length === 0 || !profesorDisponible,
    },
  ];

  const handleSubmit = async (values: any) => {
    try {
      if (!profesorDisponible) {
        console.log('❌ No se puede asignar: profesor no disponible');
        return;
      }

      if (availableAulas.length === 0) {
        console.log('❌ No se puede asignar: no hay aulas disponibles');
        return;
      }

      // Solo enviar los campos requeridos según el JSON de ejemplo
      const formattedValues = {
        trayecto_uc_id: Number(values.trayecto_uc_id),
        dia_id: selectedCell?.dia || Number(values.dia_id),
        bloque_id: selectedCell?.bloque || Number(values.bloque_id),
        aula_id: Number(values.aula_id),
        profesor_id: profesores[tabValue]?.profesor_id || Number(values.profesor_id),
        color: values.color,
        activo: values.activo,
      };
      
      console.log('Enviando datos de horario:', formattedValues);
      
      // Llamar al onSubmit que manejará la creación del horario y eliminación de disponibilidad
      await onSubmit(formattedValues);
    } catch (error) {
      console.error('Error en handleSubmit:', error);
    }
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

        {/* Alertas de disponibilidad */}
        {loadingProfesor && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Verificando disponibilidad del profesor...
          </Alert>
        )}

        {profesorError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {profesorError}
          </Alert>
        )}

        {loadingAulas && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Cargando aulas disponibles...
          </Alert>
        )}

        {aulaError && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {aulaError}
          </Alert>
        )}

        {profesorDisponible && availableAulas.length > 0 && (
          <Alert severity="success" sx={{ mb: 2 }}>
            ✅ Profesor y aulas disponibles para este horario
          </Alert>
        )}

        {profesorDisponible && availableAulas.length === 0 && !loadingAulas && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            ⚠️ Profesor disponible pero no hay aulas libres
          </Alert>
        )}

        <GenericForm
          title=""
          fields={formFields}
          initialValues={initialValues}
          onSubmit={handleSubmit}
          onCancel={onClose}
          submitButtonText="Asignar Clase"
          customFields={{
            trayecto_filter: (field: any, formikProps: any) => (
              <Field name="trayecto_filter">
                {({ field: formikField, meta }: any) => (
                  <FormControl 
                    fullWidth 
                    margin="normal" 
                    error={meta.touched && meta.error ? true : false}
                    disabled={!profesorDisponible}
                  >
                    <InputLabel id="trayecto-filter-label">
                      Filtrar por Trayecto (opcional)
                    </InputLabel>
                    <Select
                      {...formikField}
                      labelId="trayecto-filter-label"
                      label="Filtrar por Trayecto (opcional)"
                      onChange={(e) => {
                        formikField.onChange(e);
                        setSelectedTrayecto(e.target.value as string);
                        // Limpiar la selección de UC cuando cambia el filtro
                        formikProps.setFieldValue('trayecto_uc_id', '');
                      }}
                    >
                      <MenuItem value="">
                        <em>Todos los trayectos</em>
                      </MenuItem>
                      {trayectos.map((trayecto) => (
                        <MenuItem key={trayecto.trayecto_id} value={trayecto.trayecto_id?.toString()}>
                          {trayecto.nombre}
                        </MenuItem>
                      ))}
                    </Select>
                    {meta.touched && meta.error && (
                      <FormHelperText>{meta.error}</FormHelperText>
                    )}
                  </FormControl>
                )}
              </Field>
            ),
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