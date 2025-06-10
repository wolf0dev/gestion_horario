import { useState } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Toolbar,
  Typography,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Edit as EditIcon,
  Trash as TrashIcon,
  Eye as EyeIcon,
  Plus as PlusIcon,
  Search as SearchIcon,
} from 'lucide-react';

export interface Column<T = any> {
  id: string;
  label: string;
  minWidth?: number;
  align?: 'right' | 'left' | 'center';
  format?: (value: any) => string | JSX.Element;
  sortable?: boolean;
}

interface GenericTableProps {
  columns: Column[];
  data: any[];
  title: string;
  onAdd?: () => void;
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
  onView?: (item: any) => void;
  searchable?: boolean;
  searchKeys?: string[];
}

export default function GenericTable({
  columns,
  data,
  title,
  onAdd,
  onEdit,
  onDelete,
  onView,
  searchable = true,
  searchKeys = [],
}: GenericTableProps) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState<string>('');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState('');

  // Manejar cambio de página
  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Manejar cambio de filas por página
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  // Manejar ordenamiento
  const handleRequestSort = (property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Función para aplicar ordenamiento
  const sortedData = () => {
    if (!orderBy) return data;

    return [...data].sort((a, b) => {
      const aValue = a[orderBy];
      const bValue = b[orderBy];

      if (aValue < bValue) {
        return order === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return order === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  // Función para aplicar búsqueda
  const filteredData = () => {
    if (!searchTerm) return sortedData();

    return sortedData().filter((item) => {
      // Si no hay searchKeys, buscar en todas las propiedades
      if (searchKeys.length === 0) {
        return Object.values(item).some(
          (val) => val && val.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Buscar solo en las propiedades especificadas
      return searchKeys.some(
        (key) => item[key] && item[key].toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  };

  // Datos paginados
  const paginatedData = filteredData().slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: 2, boxShadow: 3 }}>
      <Toolbar
        sx={{
          pl: { sm: 2 },
          pr: { xs: 1, sm: 1 },
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <Typography sx={{ flex: '1 1 100%' }} variant="h6" id="tableTitle" component="div">
          {title}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {searchable && (
            <TextField
              variant="outlined"
              placeholder="Buscar..."
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ mr: 2, width: '200px' }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon size={20} />
                  </InputAdornment>
                ),
              }}
            />
          )}
          
          {onAdd && (
            <Tooltip title="Agregar nuevo">
              <IconButton onClick={onAdd} color="primary">
                <PlusIcon size={24} />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Toolbar>
      
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader aria-label={`tabla de ${title}`}>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth, fontWeight: 'bold' }}
                >
                  {column.sortable ? (
                    <TableSortLabel
                      active={orderBy === column.id}
                      direction={orderBy === column.id ? order : 'asc'}
                      onClick={() => handleRequestSort(column.id)}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
              {(onView || onEdit || onDelete) && (
                <TableCell align="center" style={{ minWidth: 150 }}>
                  Acciones
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row, index) => {
                return (
                  <TableRow hover role="checkbox\" tabIndex={-1} key={index}>
                    {columns.map((column) => {
                      const value = row[column.id];
                      return (
                        <TableCell key={column.id} align={column.align}>
                          {column.format ? column.format(value) : value}
                        </TableCell>
                      );
                    })}
                    {(onView || onEdit || onDelete) && (
                      <TableCell align="center">
                        {onView && (
                          <Tooltip title="Ver detalles">
                            <IconButton
                              size="small"
                              onClick={() => onView(row)}
                              color="info"
                            >
                              <EyeIcon size={18} />
                            </IconButton>
                          </Tooltip>
                        )}
                        {onEdit && (
                          <Tooltip title="Editar">
                            <IconButton
                              size="small"
                              onClick={() => onEdit(row)}
                              color="primary"
                              sx={{ ml: 1 }}
                            >
                              <EditIcon size={18} />
                            </IconButton>
                          </Tooltip>
                        )}
                        {onDelete && (
                          <Tooltip title="Eliminar">
                            <IconButton
                              size="small"
                              onClick={() => onDelete(row)}
                              color="error"
                              sx={{ ml: 1 }}
                            >
                              <TrashIcon size={18} />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (onView || onEdit || onDelete ? 1 : 0)}
                  align="center"
                  sx={{ py: 3 }}
                >
                  <Typography variant="body1" color="text.secondary">
                    No se encontraron registros
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 100]}
        component="div"
        count={filteredData().length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Filas por página:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
      />
    </Paper>
  );
}