import GenericTable, { Column } from '../../../components/generic/GenericTable';

interface Aula {
  aula_id: number;
  codigo_aula: string;
  capacidad: number;
  tipo_aula: string;
  ubicacion: string;
  descripcion: string;
  activa: boolean;
}

interface AulasTableProps {
  aulas: Aula[];
  onAdd: () => void;
  onEdit: (aula: Aula) => void;
  onDelete: (aula: Aula) => void;
}

const AulasTable = ({ aulas, onAdd, onEdit, onDelete }: AulasTableProps) => {
  const columns: Column<Aula>[] = [
    { id: 'codigo_aula', label: 'Código', minWidth: 100, sortable: true },
    { id: 'capacidad', label: 'Capacidad', minWidth: 100, align: 'right', sortable: true },
    { id: 'tipo_aula', label: 'Tipo', minWidth: 150, sortable: true },
    { id: 'ubicacion', label: 'Ubicación', minWidth: 150, sortable: true },
    { 
      id: 'activa', 
      label: 'Estado', 
      minWidth: 100, 
      sortable: true,
      format: (value: boolean) => value ? 'Activa' : 'Inactiva'
    },
  ];

  return (
    <GenericTable
      columns={columns}
      data={aulas}
      title="Aulas"
      onAdd={onAdd}
      onEdit={onEdit}
      onDelete={onDelete}
      searchable={true}
      searchKeys={['codigo_aula', 'tipo_aula', 'ubicacion']}
    />
  );
};

export default AulasTable;