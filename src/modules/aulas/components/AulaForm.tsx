import { Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material';
import { X as CloseIcon } from 'lucide-react';
import GenericForm, { FormField } from '../../../components/generic/GenericForm';

interface Aula {
  aula_id: number;
  codigo_aula: string;
  capacidad: number;
  tipo_aula: string;
  ubicacion: string;
  descripcion: string;
  activa: boolean;
}

interface AulaFormProps {
  open: boolean;
  onClose: () => void;
  currentAula: Aula | null;
  onSubmit: (values: any) => void;
}

const AulaForm = ({ open, onClose, currentAula, onSubmit }: AulaFormProps) => {
  const initialValues = currentAula || {
    codigo_aula: '',
    capacidad: 0,
    tipo_aula: '',
    ubicacion: '',
    descripcion: '',
    activa: true,
  };

  const formFields: FormField[] = [
    { 
      name: 'codigo_aula', 
      label: 'Código', 
      type: 'text', 
      required: true,
      xs: 12,
      sm: 6,
    },
    { 
      name: 'capacidad', 
      label: 'Capacidad', 
      type: 'number', 
      required: true,
      xs: 12,
      sm: 6,
    },
    { 
      name: 'tipo_aula', 
      label: 'Tipo de Aula', 
      type: 'select', 
      required: true,
      options: [
        { label: 'Laboratorio', value: 'Laboratorio' },
        { label: 'Aula teórica', value: 'Aula teórica' },
        { label: 'Auditorio', value: 'Auditorio' },
        { label: 'Sala de conferencias', value: 'Sala de conferencias' },
      ],
      xs: 12,
      sm: 6,
    },
    { 
      name: 'ubicacion', 
      label: 'Ubicación', 
      type: 'text', 
      required: true,
      xs: 12,
      sm: 6,
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

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle>
        {currentAula ? 'Editar Aula' : 'Agregar Nueva Aula'}
        <IconButton
          aria-label="close"
          onClick={onClose}
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
          initialValues={initialValues}
          onSubmit={onSubmit}
          onCancel={onClose}
          submitButtonText={currentAula ? 'Actualizar' : 'Guardar'}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AulaForm;