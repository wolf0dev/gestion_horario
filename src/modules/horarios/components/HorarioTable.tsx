import React, { useEffect } from 'react';
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
  useTheme
} from '@mui/material';
import {
  Edit as EditIcon,
  Trash as TrashIcon,
  Clock as ClockIcon,
} from 'lucide-react';

interface Horario {
  horario_id: number;
  trayecto_nombre: string;
  uc_nombre: string;
  profesor_nombre: string;
  aula_nombre: string;
  dia_nombre: string;
  bloque_nombre: string;
  activo: boolean;
}

interface HorarioTableProps {
  trayectos: any[];
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
  trayectos,
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

  useEffect(() => {
  }, [horarios, trayectos, diasSemana, bloquesHorarios]);

  const colors = [
    theme.palette.primary.light,
    theme.palette.secondary.light,
    theme.palette.info.light,
    theme.palette.warning.light,
    theme.palette.success.light,
    theme.palette.error.light,
    '#FFB74D',
    '#81C784',
    '#64B5F6',
    '#F06292',
    '#A1887F',
    '#90A4AE',
  ];

  const getHorarioForCell = (diaNombre: string, bloqueNombre: string): Horario | null => {
    const trayectoActual = trayectos[tabValue];
    if (!trayectoActual) {
      return null;
    }

    const horario = horarios.find(h =>
      h.trayecto_nombre === trayectoActual.nombre &&
      h.dia_nombre === diaNombre &&
      h.bloque_nombre === bloqueNombre &&
      h.activo
    );

    return horario || null;
  };

  const getColorForUC = (ucNombre: string): string => {
    const index = ucNombre.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
      <Paper sx={{ width: '97%', overflow: 'hidden', borderRadius: 2, boxShadow: 5 }}>
        <Box sx={{ p: 2, bgcolor: theme.palette.primary.main, color: 'white', textAlign: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Horario - {trayectos[tabValue]?.nombre || 'Seleccione un trayecto'}
          </Typography>
        </Box>

        <TableContainer sx={{ maxHeight: isForPrint ? 'none' : 800 }}>
          <Table stickyHeader={!isForPrint}>
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    fontWeight: 'bold',
                    backgroundColor: theme.palette.grey[100],
                    width: 120,
                    borderRight: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                    <ClockIcon size={18} />
                    Horario
                  </Box>
                </TableCell>
                {diasSemana.map((dia) => (
                  <TableCell
                    key={dia.dia_id}
                    align="center"
                    sx={{
                      fontWeight: 'bold',
                      backgroundColor: theme.palette.grey[100],
                      width: 150,
                      borderRight: `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    {dia.nombre_dia}
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
                      py: 2,
                      width: 120,
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, textAlign: 'center' }}>
                      {bloque.nombre_bloque}
                    </Typography>
                    <Typography variant="caption" color="textSecondary" sx={{ textAlign: 'center', display: 'block' }}>
                      {bloque.hora_inicio.substring(0, 5)} - {bloque.hora_fin.substring(0, 5)}
                    </Typography>
                  </TableCell>
                  {diasSemana.map((dia) => {
                    const horario = getHorarioForCell(dia.nombre_dia, bloque.nombre_bloque);
                    return (
                      <TableCell
                        key={`${dia.dia_id}-${bloque.bloque_id}`}
                        align="center"
                        onClick={!isForPrint ? () => onCellClick(dia.dia_id, bloque.bloque_id) : undefined}
                        sx={{
                          cursor: !isForPrint ? 'pointer' : 'default',
                          backgroundColor: horario ? getColorForUC(horario.uc_nombre) : 'transparent',
                          p: 1,
                          width: 150,
                          height: 100,
                          '&:hover': !isForPrint ? {
                            backgroundColor: horario
                              ? `${getColorForUC(horario.uc_nombre)}CC`
                              : theme.palette.action.hover,
                            transform: 'scale(1.05)',
                          } : {},
                          borderRadius: 1,
                          border: horario ? 'none' : (!isForPrint ? `2px dashed ${theme.palette.grey[300]}` : 'none'),
                          verticalAlign: 'top',
                          transition: 'all 0.2s ease-in-out',
                          borderRight: `1px solid ${theme.palette.divider}`,
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
                          }}>
                            <Typography
                              variant="subtitle2"
                              sx={{
                                fontWeight: 'bold',
                                color: 'white',
                                textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
                                mb: 0.5,
                              }}
                            >
                              {horario.uc_nombre}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                color: 'white',
                                textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
                                mb: 0.5,
                              }}
                            >
                              👨‍🏫 {horario.profesor_nombre}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                color: 'white',
                                textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
                                display: 'block',
                              }}
                            >
                              🏫 {horario.aula_nombre}
                            </Typography>
                            {!isForPrint && (
                              <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onEditHorario(horario);
                                  }}
                                  sx={{
                                    bgcolor: 'rgba(255,255,255,0.2)',
                                    color: 'white',
                                    '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                                  }}
                                >
                                  <EditIcon size={14} />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteHorario(horario);
                                  }}
                                  sx={{
                                    bgcolor: 'rgba(255,0,0,0.2)',
                                    color: 'white',
                                    '&:hover': { bgcolor: 'rgba(255,0,0,0.3)' },
                                  }}
                                >
                                  <TrashIcon size={14} />
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
