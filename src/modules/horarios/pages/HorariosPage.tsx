import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Components
import HorarioHeader from '../components/HorarioHeader';
import HorarioTabs from '../components/HorarioTabs';
import HorarioTable from '../components/HorarioTable';
import AssignDialog from '../components/AssignDialog';
import EditDialog from '../components/EditDialog';

import api from '../../../services/api';

// Tipos para el sistema de horarios
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
  activo: boolean;
}

interface HorarioForm {
  trayecto_uc_id: number;
  dia_id: number;
  bloque_id: number;
  aula_id: number;
  profesor_id: number;
  activo: boolean;
}

const HorariosPage = () => {
  const printRef = useRef<HTMLDivElement>(null);
  const [tabValue, setTabValue] = useState(0);
  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{ dia: number; bloque: number } | null>(null);
  const [currentHorario, setCurrentHorario] = useState<Horario | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Estados para datos
  const [trayectos, setTrayectos] = useState<any[]>([]);
  const [trayectosUC, setTrayectosUC] = useState<any[]>([]);
  const [diasSemana, setDiasSemana] = useState<any[]>([]);
  const [bloquesHorarios, setBloquesHorarios] = useState<any[]>([]);
  const [aulas, setAulas] = useState<any[]>([]);
  const [profesores, setProfesores] = useState<any[]>([]);
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as const });

  // Cargar datos iniciales
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          trayectosRes,
          trayectosUCRes,
          diasRes,
          bloquesRes,
          aulasRes,
          profesoresRes,
          horariosRes
        ] = await Promise.all([
          api.get('/api/trayectos/todos'),
          api.get('/api/trayectos-uc/vista'),
          api.get('/api/dias-semana/todos'),
          api.get('/api/bloques-horarios/todos'),
          api.get('/api/aulas/todas'),
          api.get('/api/profesores/todos'),
          api.get('/api/horarios/vista')
        ]);

        setTrayectos(trayectosRes.data);
        setTrayectosUC(trayectosUCRes.data);
        setDiasSemana(diasRes.data);
        setBloquesHorarios(bloquesRes.data);
        setAulas(aulasRes.data);
        setProfesores(profesoresRes.data);
        setHorarios(horariosRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        showSnackbar('Error al cargar datos', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Cambiar de pestaña (trayecto)
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Manejar clic en celda para asignar horario
  const handleCellClick = (diaId: number, bloqueId: number) => {
    const existingHorario = getHorarioForCell(diaId, bloqueId);
    if (existingHorario) {
      setCurrentHorario(existingHorario);
      setOpenEditDialog(true);
    } else {
      setSelectedCell({ dia: diaId, bloque: bloqueId });
      setOpenAssignDialog(true);
    }
  };

  // Obtener horario para una celda específica
  const getHorarioForCell = (diaId: number, bloqueId: number): Horario | null => {
    const trayectoActual = trayectos[tabValue];
    if (!trayectoActual) return null;

    return horarios.find(h =>
      h.trayecto_nombre === trayectoActual.nombre &&
      h.dia_id === diaId &&
      h.bloque_id === bloqueId &&
      h.activo
    ) || null;
  };

  // Asignar horario
  const handleAssignHorario = async (values: HorarioForm) => {
    try {
      if (!selectedCell) return;

      const horarioData = {
        ...values,
        dia_id: selectedCell.dia,
        bloque_id: selectedCell.bloque,
      };

      await api.post('/api/horarios/registro', horarioData);

      // Recargar horarios
      const response = await api.get('/api/horarios/vista');
      setHorarios(response.data);

      setOpenAssignDialog(false);
      setSelectedCell(null);
      showSnackbar('Horario asignado exitosamente', 'success');
    } catch (error) {
      console.error('Error assigning horario:', error);
      showSnackbar('Error al asignar horario', 'error');
    }
  };

  // Actualizar horario
  const handleUpdateHorario = async (values: HorarioForm) => {
    try {
      if (!currentHorario) return;

      await api.put('/api/horarios/actualizar', {
        ...values,
        horario_id: currentHorario.horario_id,
      });

      // Recargar horarios
      const response = await api.get('/api/horarios/vista');
      setHorarios(response.data);

      setOpenEditDialog(false);
      setCurrentHorario(null);
      showSnackbar('Horario actualizado exitosamente', 'success');
    } catch (error) {
      console.error('Error updating horario:', error);
      showSnackbar('Error al actualizar horario', 'error');
    }
  };

  // Eliminar horario
  const handleDeleteHorario = async (horario: Horario) => {
    try {
      await api.delete(`/api/horarios/eliminar/${horario.horario_id}`);

      // Recargar horarios
      const response = await api.get('/api/horarios/vista');
      setHorarios(response.data);

      showSnackbar('Horario eliminado exitosamente', 'success');
    } catch (error) {
      console.error('Error deleting horario:', error);
      showSnackbar('Error al eliminar horario', 'error');
    }
  };

  // Función para exportar a PDF
  const handleExportPDF = async () => {
    if (!printRef.current) return;

    setIsExporting(true);
    try {
      const width = printRef.current.scrollWidth;
      const height = printRef.current.scrollHeight;

      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: width,
        height: height,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('landscape', 'mm', [width * 0.264683, height * 0.264583]);

      // Añadir logo
      const logo = new Image();
      logo.src = `${window.location.origin}/icons.png`;
      await new Promise((resolve) => {
        logo.onload = resolve;
      });

      pdf.addImage(logo, 'PNG', 10, 10, 30, 15);

      // Agregar título
      pdf.setFontSize(20);
      pdf.text('Sistema de Gestión de Horarios UBV', pdf.internal.pageSize.getWidth() / 2, 20, { align: 'center' });

      if (trayectos[tabValue]) {
        pdf.setFontSize(16);
        pdf.text(`Horario - ${trayectos[tabValue].nombre}`, pdf.internal.pageSize.getWidth() / 2, 30, { align: 'center' });
      }

      // Añadir la imagen al PDF
      pdf.addImage(imgData, 'PNG', 10, 40, pdf.internal.pageSize.getWidth() - 20, pdf.internal.pageSize.getHeight() - 50);

      // Agregar fecha de generación
      pdf.setFontSize(10);
      pdf.text(`Generado el: ${new Date().toLocaleDateString('es-ES')}`, pdf.internal.pageSize.getWidth() / 2, pdf.internal.pageSize.getHeight() - 10, { align: 'center' });

      // Guardar el PDF en sessionStorage
      const pdfBlob = pdf.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      const pdfName = `horario - ${trayectos[tabValue]?.nombre || 'general'}`;
      sessionStorage.setItem(pdfName, pdfUrl);

      // Abrir una nueva pestaña para mostrar el PDF
      const viewWindow = window.open('', '_blank');
      if (!viewWindow) {
        console.error('Failed to open view window');
        return;
      }

      // Escribir el contenido en la nueva ventana
      viewWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${pdfName}</title>
          </head>
          <body style="margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; height: 100vh;">
            <embed width="100%" height="100%" src="${pdfUrl}" type="application/pdf" />
          </body>
        </html>
      `);

      viewWindow.document.close();
      viewWindow.focus();

    } catch (error) {
      console.error('Error generating PDF:', error);
      showSnackbar('Error al generar PDF', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  // Mostrar mensaje
  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  // Cerrar mensaje
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <Box sx={{ width: '97%', marginLeft: 2 }}>
        <HorarioHeader
          trayectos={trayectos}
          horarios={horarios}
          profesores={profesores}
          aulas={aulas}
          isExporting={isExporting}
          onExportPDF={handleExportPDF}
        />
      </Box>

      {/* Pestañas de trayectos */}
      <Box sx={{ width: '97%', marginLeft: 2 }}>
        <HorarioTabs
          trayectos={trayectos}
          tabValue={tabValue}
          onTabChange={handleTabChange}
        />
      </Box>

      {/* Tabla de horarios */}
      <div ref={printRef} className="print-area">
        <HorarioTable
          trayectos={trayectos}
          diasSemana={diasSemana}
          bloquesHorarios={bloquesHorarios}
          horarios={horarios}
          tabValue={tabValue}
          onCellClick={handleCellClick}
          onEditHorario={(horario) => {
            setCurrentHorario(horario);
            setOpenEditDialog(true);
          }}
          onDeleteHorario={handleDeleteHorario}
        />
      </div>

      {/* Diálogo para asignar horario */}
      <AssignDialog
        open={openAssignDialog}
        onClose={() => setOpenAssignDialog(false)}
        selectedCell={selectedCell}
        trayectos={trayectos}
        trayectosUC={trayectosUC}
        diasSemana={diasSemana}
        bloquesHorarios={bloquesHorarios}
        aulas={aulas}
        profesores={profesores}
        tabValue={tabValue}
        onSubmit={handleAssignHorario}
      />

      {/* Diálogo para editar horario */}
      <EditDialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        currentHorario={currentHorario}
        trayectosUC={trayectosUC}
        aulas={aulas}
        profesores={profesores}
        onSubmit={handleUpdateHorario}
      />

      {/* Notificaciones */}
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default HorariosPage;
