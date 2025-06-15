import React, { useEffect, useState } from 'react';
import {
  Paper,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Edit as EditIcon,
  Trash as TrashIcon,
  Clock as ClockIcon,
} from 'lucide-react';

import { useAuth } from '../../../contexts/AuthContext';

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

interface HorarioTableProps {
  profesores: any[];
  diasSemana: any[];
  bloquesHorarios: any[];
  horarios: Horario[];
  tabValue: number;
  onCellClick: (diaId: number, bloqueId: number) => void;
  onEditHorario: (horario: Horario) => void;
  onDeleteHorario: (horario: Horario) => void;
  isForPrint?: boolean;
}

const HorarioTable = ({
  profesores,
  diasSemana,
  bloquesHorarios,
  horarios,
  tabValue,
  onCellClick,
  onEditHorario,
  onDeleteHorario,
  isForPrint = false,
}: HorarioTableProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);
  const { userRoles, hasPermission } = useAuth();

  // Verificar si el usuario es solo "usuario asignado" (solo lectura)
  const isReadOnlyUser = userRoles.includes('usuario asignado') && !hasPermission('gestion_horarios');

  useEffect(() => {
  }, [horarios, profesores, diasSemana, bloquesHorarios]);

  const defaultColors = [
    '#1976d2',
    '#f50057',
    '#ff9800',
    '#4caf50',
    '#9c27b0',
    '#00bcd4',
    '#ff5722',
    '#795548',
    '#607d8b',
    '#e91e63',
    '#3f51b5',
    '#009688',
  ];

  const getHorarioForCell = (diaNombre: string, bloqueNombre: string): Horario | null => {
    const profesorActual = profesores[tabValue];
    if (!profesorActual) {
      return null;
    }

    const horario = horarios.find(h =>
      h.profesor_id === profesorActual.profesor_id &&
      h.dia_nombre === diaNombre &&
      h.bloque_nombre === bloqueNombre &&
      h.activo
    );

    return horario || null;
  };

  const getColorForHorario = (horario: Horario): string => {
    // Si el horario tiene un color asignado, usarlo
    if (horario.color) {
      return horario.color;
    }
    
    // Si no, usar un color por defecto basado en el nombre de la UC
    const index = horario.uc_nombre.charCodeAt(0) % defaultColors.length;
    return defaultColors[index];
  };

  // Función para manejar el clic en la celda
  const handleCellClick = (diaId: number, bloqueId: number, horario: Horario | null) => {
    // Solo permitir agregar si no hay horario existente y el usuario no es de solo lectura
    if (!horario && !isReadOnlyUser) {
      onCellClick(diaId, bloqueId);
    }
  };

  // Configuración responsiva para el tamaño de las celdas
  const cellWidth = isForPrint ? 150 : (isSmall ? 120 : isMobile ? 140 : 150);
  const cellHeight = isForPrint ? 100 : (isSmall ? 80 : isMobile ? 90 : 100);
  const headerCellWidth = isForPrint ? 120 : (isSmall ? 80 : isMobile ? 100 : 120);

  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      width: '100%',
      px: { xs: 1, sm: 2 }
    }}>
      <Paper sx={{ 
        width: '100%', 
        maxWidth: isForPrint ? 'none' : '100%',
        overflow: 'hidden', 
        borderRadius: 2, 
        boxShadow: 5 
      }}>
        <Box sx={{ 
          p: { xs: 1, sm: 2 }, 
          bgcolor: theme.palette.primary.main, 
          color: 'white', 
          textAlign: 'center' 
        }}>
          <Typography 
            variant={isMobile ? "subtitle1" : "h6"} 
            sx={{ 
              fontWeight: 600,
              fontSize: { xs: '1rem', sm: '1.25rem' }
            }}
          >
            Horario - {profesores[tabValue] ? `${profesores[tabValue].nombre} ${profesores[tabValue].apellido}` : 'Seleccione un profesor'}
          </Typography>
          {isReadOnlyUser && (
            <Typography variant="caption" sx={{ display: 'block', mt: 0.5, opacity: 0.8 }}>
              Modo solo lectura
            </Typography>
          )}
        </Box>

        <TableContainer sx={{ 
          maxHeight: isForPrint ? 'none' : (isMobile ? 600 : 800),
          overflowX: 'auto'
        }}>
          <Table 
            stickyHeader={!isForPrint}
            sx={{
              minWidth: isForPrint ? 'auto' : (isSmall ? 600 : 800)
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    fontWeight: 'bold',
                    backgroundColor: theme.palette.grey[100],
                    width: headerCellWidth,
                    minWidth: headerCellWidth,
                    borderRight: `1px solid ${theme.palette.divider}`,
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    p: { xs: 1, sm: 2 }
                  }}
                >
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 0.5, 
                    justifyContent: 'center',
                    flexDirection: { xs: 'column', sm: 'row' }
                  }}>
                    <ClockIcon size={isSmall ? 14 : 18} />
                    <Typography variant="caption" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                      Horario
                    </Typography>
                  </Box>
                </TableCell>
                {diasSemana.map((dia) => (
                  <TableCell
                    key={dia.dia_id}
                    align="center"
                    sx={{
                      fontWeight: 'bold',
                      backgroundColor: theme.palette.grey[100],
                      width: cellWidth,
                      minWidth: cellWidth,
                      borderRight: `1px solid ${theme.palette.divider}`,
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      p: { xs: 0.5, sm: 1 }
                    }}
                  >
                    {isSmall ? dia.abreviacion || dia.nombre_dia.substring(0, 3) : dia.nombre_dia}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {bloquesHorarios.map((bloque) => (
                <TableRow key={bloque.bloque_id} hover>
                  <TableCell
                    sx={{
                      fontWeight: 'bold',
                      backgroundColor: theme.palette.grey[50],
                      borderRight: `1px solid ${theme.palette.divider}`,
                      verticalAlign: 'top',
                      py: { xs: 1, sm: 2 },
                      px: { xs: 0.5, sm: 1 },
                      width: headerCellWidth,
                      minWidth: headerCellWidth,
                    }}
                  >
                    <Typography 
                      variant="subtitle2" 
                      sx={{ 
                        fontWeight: 700, 
                        textAlign: 'center',
                        fontSize: { xs: '0.7rem', sm: '0.875rem' }
                      }}
                    >
                      {bloque.nombre_bloque}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      color="textSecondary" 
                      sx={{ 
                        textAlign: 'center', 
                        display: 'block',
                        fontSize: { xs: '0.6rem', sm: '0.75rem' }
                      }}
                    >
                      {bloque.hora_inicio.substring(0, 5)} - {bloque.hora_fin.substring(0, 5)}
                    </Typography>
                  </TableCell>
                  {diasSemana.map((dia) => {
                    const horario = getHorarioForCell(dia.nombre_dia, bloque.nombre_bloque);
                    const backgroundColor = horario ? getColorForHorario(horario) : 'transparent';
                    const cellKey = `${dia.dia_id}-${bloque.bloque_id}`;
                    const isHovered = hoveredCell === cellKey;
                    
                    return (
                      <TableCell
                        key={cellKey}
                        align="center"
                        onClick={!isForPrint ? () => handleCellClick(dia.dia_id, bloque.bloque_id, horario) : undefined}
                        onMouseEnter={() => !isForPrint && setHoveredCell(cellKey)}
                        onMouseLeave={() => !isForPrint && setHoveredCell(null)}
                        sx={{
                          cursor: !isForPrint ? (horario ? 'default' : (isReadOnlyUser ? 'default' : 'pointer')) : 'default',
                          backgroundColor: backgroundColor,
                          p: { xs: 0.5, sm: 1 },
                          width: cellWidth,
                          minWidth: cellWidth,
                          height: cellHeight,
                          '&:hover': !isForPrint ? {
                            backgroundColor: horario
                              ? `${backgroundColor}CC`
                              : (isReadOnlyUser ? 'transparent' : theme.palette.action.hover),
                            transform: isMobile ? 'none' : 'scale(1.02)',
                          } : {},
                          borderRadius: 1,
                          border: horario ? 'none' : (!isForPrint && !isReadOnlyUser ? `2px dashed ${theme.palette.grey[300]}` : 'none'),
                          verticalAlign: 'top',
                          transition: 'all 0.2s ease-in-out',
                          borderRight: `1px solid ${theme.palette.divider}`,
                          position: 'relative',
                        }}
                      >
                        {horario ? (
                          <Box sx={{
                            textAlign: 'center',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                            gap: { xs: 0.25, sm: 0.5 },
                            position: 'relative',
                          }}>
                            <Typography
                              variant="subtitle2"
                              sx={{
                                fontWeight: 'bold',
                                color: 'white',
                                textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
                                fontSize: { xs: '0.65rem', sm: '0.875rem' },
                                lineHeight: 1.1,
                                mb: 0.25,
                              }}
                            >
                              {isSmall && horario.uc_nombre.length > 15 
                                ? `${horario.uc_nombre.substring(0, 15)}...` 
                                : horario.uc_nombre}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                color: 'white',
                                textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
                                fontSize: { xs: '0.6rem', sm: '0.75rem' },
                                lineHeight: 1.1,
                                mb: 0.25,
                              }}
                            >
                              📚 {isSmall && horario.trayecto_nombre.length > 12 
                                ? `${horario.trayecto_nombre.substring(0, 12)}...` 
                                : horario.trayecto_nombre}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                color: 'white',
                                textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
                                display: 'block',
                                fontSize: { xs: '0.55rem', sm: '0.7rem' },
                                lineHeight: 1.1,
                              }}
                            >
                              🏫 {horario.aula_nombre}
                            </Typography>
                            
                            {/* Botones que aparecen solo al hacer hover y si no es usuario de solo lectura */}
                            {!isForPrint && isHovered && !isReadOnlyUser && (
                              <Box sx={{ 
                                position: 'absolute',
                                top: 4,
                                right: 4,
                                display: 'flex', 
                                flexDirection: 'column',
                                gap: 0.5,
                                opacity: 1,
                                transition: 'opacity 0.2s ease-in-out',
                              }}>
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onEditHorario(horario);
                                  }}
                                  sx={{
                                    bgcolor: 'rgba(255,255,255,0.9)',
                                    color: theme.palette.primary.main,
                                    width: { xs: 20, sm: 24 },
                                    height: { xs: 20, sm: 24 },
                                    '&:hover': { 
                                      bgcolor: 'rgba(255,255,255,1)',
                                      transform: 'scale(1.1)',
                                    },
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                  }}
                                >
                                  <EditIcon size={isSmall ? 10 : 12} />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteHorario(horario);
                                  }}
                                  sx={{
                                    bgcolor: 'rgba(255,255,255,0.9)',
                                    color: theme.palette.error.main,
                                    width: { xs: 20, sm: 24 },
                                    height: { xs: 20, sm: 24 },
                                    '&:hover': { 
                                      bgcolor: 'rgba(255,255,255,1)',
                                      transform: 'scale(1.1)',
                                    },
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                  }}
                                >
                                  <TrashIcon size={isSmall ? 10 : 12} />
                                </IconButton>
                              </Box>
                            )}
                          </Box>
                        ) : (
                          <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                          }}>
                            {/* Celda vacía - solo se puede hacer clic para agregar si no es usuario de solo lectura */}
                          </Box>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default HorarioTable;