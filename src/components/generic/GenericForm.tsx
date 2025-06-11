import { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Switch,
  FormControlLabel,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  IconButton,
  Stack,
  Divider,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Save as SaveIcon, X as CloseIcon } from 'lucide-react';

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'password' | 'textarea' | 'select' | 'boolean' | 'date' | 'time';
  required?: boolean;
  options?: Array<{ label: string; value: any }>;
  validation?: any;
  fullWidth?: boolean;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  multiline?: boolean;
  rows?: number;
  defaultValue?: any;
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
}

interface GenericFormProps {
  title: string;
  fields: FormField[];
  initialValues: any;
  onSubmit: (values: any, helpers: FormikHelpers<any>) => void | Promise<void>;
  onCancel?: () => void;
  submitButtonText?: string;
  isLoading?: boolean;
  validationSchema?: any;
  customFields?: Record<string, (field: FormField, formikProps: any) => React.ReactNode>;
}

const GenericForm = ({
  title,
  fields,
  initialValues,
  onSubmit,
  onCancel,
  submitButtonText = 'Guardar',
  isLoading = false,
  validationSchema: customValidationSchema,
  customFields = {},
}: GenericFormProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [generatedValidationSchema, setGeneratedValidationSchema] = useState<any>(null);

  // Generar esquema de validación a partir de las definiciones de los campos
  useEffect(() => {
    if (customValidationSchema) {
      setGeneratedValidationSchema(customValidationSchema);
      return;
    }

    let schemaObj: Record<string, any> = {};

    fields.forEach((field) => {
      let fieldValidator;

      // Configurar validador base según el tipo de campo
      switch (field.type) {
        case 'text':
          fieldValidator = Yup.string();
          break;
        case 'number':
          fieldValidator = Yup.number().typeError('Debe ser un número');
          break;
        case 'email':
          fieldValidator = Yup.string().email('Email inválido');
          break;
        case 'password':
          fieldValidator = Yup.string().min(6, 'La contraseña debe tener al menos 6 caracteres');
          break;
        case 'date':
          fieldValidator = Yup.date().typeError('Fecha inválida');
          break;
        case 'boolean':
          fieldValidator = Yup.boolean();
          break;
        case 'select':
          fieldValidator = Yup.mixed();
          break;
        default:
          fieldValidator = Yup.string();
      }

      // Aplicar requerido si es necesario
      if (field.required) {
        fieldValidator = fieldValidator.required('Este campo es requerido');
      }

      // Aplicar validaciones personalizadas
      if (field.validation) {
        fieldValidator = fieldValidator.concat(field.validation);
      }

      schemaObj[field.name] = fieldValidator;
    });

    setGeneratedValidationSchema(Yup.object().shape(schemaObj));
  }, [fields, customValidationSchema]);

  // Renderizar campo según su tipo
  const renderField = (field: FormField, formikProps: any) => {
    // Si hay un campo personalizado definido, usarlo
    if (customFields[field.name]) {
      return customFields[field.name](field, formikProps);
    }

    const fieldProps = {
      name: field.name,
      fullWidth: field.fullWidth !== false,
      label: field.label,
      placeholder: field.placeholder,
      disabled: field.disabled || isLoading,
      margin: 'normal' as const,
      size: isMobile ? 'small' as const : 'medium' as const,
    };

    switch (field.type) {
      case 'textarea':
        return (
          <Field
            as={TextField}
            {...fieldProps}
            multiline
            rows={field.rows || 4}
          />
        );

      case 'select':
        return (
          <Field name={field.name}>
            {({ field: formikField, meta }: any) => (
              <FormControl
                fullWidth={field.fullWidth !== false}
                margin="normal"
                error={meta.touched && meta.error ? true : false}
                size={isMobile ? 'small' : 'medium'}
              >
                <InputLabel id={`${field.name}-label`}>{field.label}</InputLabel>
                <Select
                  {...formikField}
                  labelId={`${field.name}-label`}
                  label={field.label}
                  disabled={field.disabled || isLoading}
                >
                  {field.options?.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                {meta.touched && meta.error && (
                  <FormHelperText>{meta.error}</FormHelperText>
                )}
              </FormControl>
            )}
          </Field>
        );

      case 'boolean':
        return (
          <Field name={field.name}>
            {({ field: formikField }: any) => (
              <FormControl margin="normal" fullWidth={field.fullWidth !== false}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formikField.value}
                      onChange={formikField.onChange}
                      name={field.name}
                      disabled={field.disabled || isLoading}
                      color="primary"
                      size={isMobile ? 'small' : 'medium'}
                    />
                  }
                  label={field.label}
                />
              </FormControl>
            )}
          </Field>
        );

      default:
        return (
          <Field
            as={TextField}
            {...fieldProps}
            type={field.type}
          />
        );
    }
  };

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: { xs: 2, sm: 3 }, 
        borderRadius: 2,
        maxWidth: '100%',
        overflow: 'hidden'
      }}
    >
      {title && (
        <Box sx={{ mb: { xs: 2, sm: 3 } }}>
          <Typography 
            variant={isMobile ? "h6" : "h5"} 
            component="h2"
            sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
          >
            {title}
          </Typography>
          <Divider sx={{ mt: 1 }} />
        </Box>
      )}

      {generatedValidationSchema ? (
        <Formik
          initialValues={initialValues}
          validationSchema={generatedValidationSchema}
          onSubmit={onSubmit}
          enableReinitialize
        >
          {(formikProps) => {
            const { errors, touched, isSubmitting } = formikProps;
            
            return (
              <Form>
                <Grid container spacing={{ xs: 1, sm: 2 }}>
                  {fields.map((field) => (
                    <Grid
                      item
                      xs={field.xs || 12}
                      sm={field.sm || (isMobile ? 12 : 6)}
                      md={field.md || 4}
                      lg={field.lg || 4}
                      xl={field.xl || 3}
                      key={field.name}
                    >
                      {renderField(field, formikProps)}
                      <ErrorMessage
                        name={field.name}
                        component={Typography}
                        sx={{ 
                          color: 'error.main', 
                          fontSize: { xs: '0.7rem', sm: '0.75rem' }, 
                          mt: 0.5, 
                          ml: 1 
                        }}
                      />
                    </Grid>
                  ))}
                  
                  {/* Renderizar campos personalizados que no están en fields */}
                  {Object.keys(customFields).filter(key => !fields.find(f => f.name === key)).map((key) => (
                    <Grid item xs={12} key={key}>
                      {customFields[key]({} as FormField, formikProps)}
                    </Grid>
                  ))}
                </Grid>

                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={2}
                  justifyContent="flex-end"
                  sx={{ 
                    mt: { xs: 3, sm: 4 },
                    gap: { xs: 1, sm: 2 }
                  }}
                >
                  {onCancel && (
                    <Button
                      variant="outlined"
                      onClick={onCancel}
                      startIcon={<CloseIcon size={18} />}
                      disabled={isSubmitting || isLoading}
                      size={isMobile ? 'small' : 'medium'}
                      fullWidth={isMobile}
                    >
                      Cancelar
                    </Button>
                  )}
                  
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    startIcon={
                      isSubmitting || isLoading ? (
                        <CircularProgress size={16} color="inherit" />
                      ) : (
                        <SaveIcon size={18} />
                      )
                    }
                    disabled={isSubmitting || isLoading}
                    size={isMobile ? 'small' : 'medium'}
                    fullWidth={isMobile}
                  >
                    {submitButtonText}
                  </Button>
                </Stack>
              </Form>
            );
          }}
        </Formik>
      ) : (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      )}
    </Paper>
  );
};

export default GenericForm;