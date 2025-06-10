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
  useMediaQuery,
  useTheme,
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  
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
    <Paper sx={{ 
      width: '100%', 
      overflow: 'hidden', 
      borderRadius: 2, 
      boxShadow: 3,
      mx: { xs: 0, sm: 'auto' }
    }}>
      <Toolbar
        sx={{
          pl: { sm: 2 },
          pr: { xs: 1, sm: 1 },
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'stretch', sm: 'center' },
          justifyContent: 'space-between',
          gap: { xs: 2, sm: 0 },
          py: { xs: 2, sm: 1 }
        }}
      >
        <Typography 
          sx={{ 
            flex: { xs: 'none', sm: '1 1 100%' },
            textAlign: { xs: 'center', sm: 'left' }
          }} 
          variant={isMobile ? "h6" : "h6"} 
          id="tableTitle" 
          component="div"
        >
          {title}
        </Typography>

        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 1, sm: 2 },
          width: { xs: '100%', sm: 'auto' }
        }}>
          {searchable && (
            <TextField
              variant="outlined"
              placeholder="Buscar..."
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ 
                width: { xs: '100%', sm: '200px' },
                order: { xs: 2, sm: 1 }
              }}
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
              <IconButton 
                onClick={onAdd} 
                color="primary"
                sx={{ order: { xs: 1, sm: 2 } }}
              >
                <PlusIcon size={24} />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Toolbar>
      
      <TableContainer sx={{ 
        maxHeight: { xs: 400, sm: 440 },
        overflowX: 'auto'
      }}>
        <Table stickyHeader aria-label={`tabla de ${title}`}>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ 
                    minWidth: isMobile ? Math.min(column.minWidth || 100, 120) : column.minWidth,
                    fontWeight: 'bold',
                    fontSize: isMobile ? '0.875rem' : '1rem'
                  }}
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
                <TableCell 
                  align="center" 
                  style={{ 
                    minWidth: isMobile ? 100 : 150,
                    fontWeight: 'bold',
                    fontSize: isMobile ? '0.875rem' : '1rem'
                  }}
                >
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
                        <TableCell 
                          key={column.id} 
                          align={column.align}
                          sx={{
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            py: { xs: 1, sm: 2 }
                          }}
                        >
                          {column.format ? column.format(value) : value}
                        </TableCell>
                      );
                    })}
                    {(onView || onEdit || onDelete) && (
                      <TableCell align="center">
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'center', 
                          gap: { xs: 0.5, sm: 1 },
                          flexWrap: isMobile ? 'wrap' : 'nowrap'
                        }}>
                          {onView && (
                            <Tooltip title="Ver detalles">
                              <IconButton
                                size={isMobile ? "small" : "medium"}
                                onClick={() => onView(row)}
                                color="info"
                              >
                                <EyeIcon size={isMobile ? 16 : 18} />
                              </IconButton>
                            </Tooltip>
                          )}
                          {onEdit && (
                            <Tooltip title="Editar">
                              <IconButton
                                size={isMobile ? "small" : "medium"}
                                onClick={() => onEdit(row)}
                                color="primary"
                              >
                                <EditIcon size={isMobile ? 16 : 18} />
                              </IconButton>
                            </Tooltip>
                          )}
                          {onDelete && (
                            <Tooltip title="Eliminar">
                              <IconButton
                                size={isMobile ? "small" : "medium"}
                                onClick={() => onDelete(row)}
                                color="error"
                              >
                                <TrashIcon size={isMobile ? 16 : 18} />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
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
        sx={{
          '& .MuiTablePagination-toolbar': {
            fontSize: { xs: '0.75rem', sm: '0.875rem' },
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 1, sm: 0 }
          },
          '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
            fontSize: { xs: '0.75rem', sm: '0.875rem' }
          }
        }}
      />
    </Paper>
  );
}