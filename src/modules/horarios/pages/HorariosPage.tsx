import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Snackbar,
  Alert,
  CircularProgress,
  useMediaQuery,
  useTheme,
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
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

  // Función para exportar a PDF optimizada para móvil
  const handleExportPDF = async () => {
    if (!printRef.current) return;

    setIsExporting(true);
    try {
      // Crear un elemento temporal para el PDF con estilos optimizados
      const printElement = printRef.current.cloneNode(true) as HTMLElement;
      
      // Aplicar estilos específicos para PDF
      printElement.style.width = '1200px';
      printElement.style.transform = 'scale(1)';
      printElement.style.transformOrigin = 'top left';
      
      // Crear un contenedor temporal
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.top = '-9999px';
      tempContainer.style.left = '-9999px';
      tempContainer.style.width = '1200px';
      tempContainer.style.backgroundColor = '#ffffff';
      tempContainer.appendChild(printElement);
      document.body.appendChild(tempContainer);

      // Esperar un momento para que se rendericen los estilos
      await new Promise(resolve => setTimeout(resolve, 500));

      const canvas = await html2canvas(printElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 1200,
        height: printElement.scrollHeight,
        scrollX: 0,
        scrollY: 0,
      });

      // Limpiar el elemento temporal
      document.body.removeChild(tempContainer);

      const imgData = canvas.toDataURL('image/png');
      
      // Configurar PDF en orientación landscape
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Calcular dimensiones manteniendo proporción
      const imgWidth = pdfWidth - 20; // Margen de 10mm a cada lado
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Añadir logo si existe
      try {
        const logo = new Image();
        logo.crossOrigin = 'anonymous';
        logo.src = `${window.location.origin}/icons.png`;
        await new Promise((resolve, reject) => {
          logo.onload = resolve;
          logo.onerror = reject;
        });
        pdf.addImage(logo, 'PNG', 10, 10, 30, 15);
      } catch (error) {
        console.warn('No se pudo cargar el logo:', error);
      }

      // Agregar título
      pdf.setFontSize(20);
      pdf.text('Sistema de Gestión de Horarios UBV', pdfWidth / 2, 20, { align: 'center' });

      if (trayectos[tabValue]) {
        pdf.setFontSize(16);
        pdf.text(`Horario - ${trayectos[tabValue].nombre}`, pdfWidth / 2, 30, { align: 'center' });
      }

      // Verificar si necesita múltiples páginas
      if (imgHeight > pdfHeight - 50) {
        // Dividir en múltiples páginas si es necesario
        let yPosition = 40;
        const pageHeight = pdfHeight - 60;
        let remainingHeight = imgHeight;
        let sourceY = 0;

        while (remainingHeight > 0) {
          const currentPageHeight = Math.min(pageHeight, remainingHeight);
          const currentSourceHeight = (currentPageHeight * canvas.height) / imgHeight;

          // Crear canvas para esta página
          const pageCanvas = document.createElement('canvas');
          pageCanvas.width = canvas.width;
          pageCanvas.height = currentSourceHeight;
          const pageCtx = pageCanvas.getContext('2d');
          
          if (pageCtx) {
            pageCtx.drawImage(canvas, 0, sourceY, canvas.width, currentSourceHeight, 0, 0, canvas.width, currentSourceHeight);
            const pageImgData = pageCanvas.toDataURL('image/png');
            pdf.addImage(pageImgData, 'PNG', 10, yPosition, imgWidth, currentPageHeight);
          }

          remainingHeight -= currentPageHeight;
          sourceY += currentSourceHeight;

          if (remainingHeight > 0) {
            pdf.addPage();
            yPosition = 10;
          }
        }
      } else {
        // Añadir la imagen completa
        pdf.addImage(imgData, 'PNG', 10, 40, imgWidth, imgHeight);
      }

      // Agregar fecha de generación en la última página
      pdf.setFontSize(10);
      pdf.text(`Generado el: ${new Date().toLocaleDateString('es-ES')}`, pdfWidth / 2, pdfHeight - 10, { align: 'center' });

      // Guardar el PDF
      const pdfName = `horario-${trayectos[tabValue]?.nombre || 'general'}.pdf`;
      
      if (isMobile) {
        // En móvil, abrir en nueva pestaña
        const pdfBlob = pdf.output('blob');
        const pdfUrl = URL.createObjectURL(pdfBlob);
        window.open(pdfUrl, '_blank');
      } else {
        // En desktop, descargar directamente
        pdf.save(pdfName);
      }

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
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh' 
      }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      width: '100%', 
      overflow: 'hidden',
      px: { xs: 0, sm: 1 }
    }}>
      {/* Header */}
      <Box sx={{ 
        width: '100%', 
        mb: { xs: 1, sm: 2 }
      }}>
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
      <Box sx={{ 
        width: '100%', 
        mb: { xs: 1, sm: 2 }
      }}>
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
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: isMobile ? 'center' : 'left' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default HorariosPage;