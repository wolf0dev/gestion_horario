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
  trayecto_id: number;
  color?: string;
  activo: boolean;
}

interface HorarioForm {
  trayecto_uc_id: number;
  dia_id: number;
  bloque_id: number;
  aula_id: number;
  profesor_id: number;
  color?: string;
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
  const [profesores, setProfesores] = useState<any[]>([]);
  const [trayectos, setTrayectos] = useState<any[]>([]);
  const [trayectosUC, setTrayectosUC] = useState<any[]>([]);
  const [diasSemana, setDiasSemana] = useState<any[]>([]);
  const [bloquesHorarios, setBloquesHorarios] = useState<any[]>([]);
  const [aulas, setAulas] = useState<any[]>([]);
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as const });

  // Cargar datos iniciales
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          profesoresRes,
          trayectosRes,
          trayectosUCRes,
          diasRes,
          bloquesRes,
          aulasRes,
          horariosRes
        ] = await Promise.all([
          api.get('/api/profesores/todos'),
          api.get('/api/trayectos/todos'),
          api.get('/api/trayectos-uc/vista'),
          api.get('/api/dias-semana/todos'),
          api.get('/api/bloques-horarios/todos'),
          api.get('/api/aulas/todas'),
          api.get('/api/horarios/vista')
        ]);

        setProfesores(profesoresRes.data);
        setTrayectos(trayectosRes.data);
        setTrayectosUC(trayectosUCRes.data);
        setDiasSemana(diasRes.data);
        setBloquesHorarios(bloquesRes.data);
        setAulas(aulasRes.data);
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

  // Cambiar de pestaña (profesor)
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
    const profesorActual = profesores[tabValue];
    if (!profesorActual) return null;

    return horarios.find(h =>
      h.profesor_id === profesorActual.profesor_id &&
      h.dia_id === diaId &&
      h.bloque_id === bloqueId &&
      h.activo
    ) || null;
  };

  // Función para obtener IDs a partir de nombres
  const getIdFromName = (name: string, array: any[], nameField: string, idField: string): number | null => {
    const item = array.find(item => item[nameField] === name);
    return item ? item[idField] : null;
  };

  // Función para enriquecer horario con IDs faltantes
  const enrichHorarioWithIds = (horario: Horario): Horario => {
    const enrichedHorario = { ...horario };

    // Si faltan IDs, buscarlos por nombre
    if (!enrichedHorario.dia_id && enrichedHorario.dia_nombre) {
      enrichedHorario.dia_id = getIdFromName(enrichedHorario.dia_nombre, diasSemana, 'nombre_dia', 'dia_id') || 0;
    }

    if (!enrichedHorario.bloque_id && enrichedHorario.bloque_nombre) {
      enrichedHorario.bloque_id = getIdFromName(enrichedHorario.bloque_nombre, bloquesHorarios, 'nombre_bloque', 'bloque_id') || 0;
    }

    if (!enrichedHorario.aula_id && enrichedHorario.aula_nombre) {
      enrichedHorario.aula_id = getIdFromName(enrichedHorario.aula_nombre, aulas, 'codigo_aula', 'aula_id') || 0;
    }

    if (!enrichedHorario.profesor_id && enrichedHorario.profesor_nombre) {
      const nombreCompleto = enrichedHorario.profesor_nombre;
      const profesor = profesores.find(p => `${p.nombre} ${p.apellido}` === nombreCompleto);
      enrichedHorario.profesor_id = profesor ? profesor.profesor_id : 0;
    }

    return enrichedHorario;
  };

  // CORREGIDO: Función para eliminar aula de disponibilidad usando disponibilidad_aula_id
  const removeAulaFromDisponibilidad = async (aulaId: number, diaId: number, bloqueId: number) => {
    try {
      console.log('Eliminando disponibilidad para:', { aulaId, diaId, bloqueId });
      
      // Buscar la disponibilidad específica
      const disponibilidadResponse = await api.get('/api/disponibilidad-aulas/vista');
      const disponibilidades = disponibilidadResponse.data;
      
      const dia = diasSemana.find(d => d.dia_id === diaId);
      const bloque = bloquesHorarios.find(b => b.bloque_id === bloqueId);
      const aula = aulas.find(a => a.aula_id === aulaId);
      
      if (!dia || !bloque || !aula) {
        console.error('No se encontraron datos para eliminar disponibilidad:', { dia, bloque, aula });
        return;
      }

      console.log('Buscando disponibilidad con:', {
        dia_nombre: dia.nombre_dia,
        bloque_nombre: bloque.nombre_bloque,
        aula_codigo: aula.codigo_aula
      });

      const disponibilidad = disponibilidades.find((disp: any) => {
        const coincideDia = disp.dia_nombre === dia.nombre_dia;
        const coincideBloque = disp.bloque_nombre === bloque.nombre_bloque;
        const coincideAula = disp.aula_nombre === aula.codigo_aula || disp.aula_nombre === aula.aula_id.toString();
        
        console.log('Comparando disponibilidad:', {
          disp_dia: disp.dia_nombre,
          disp_bloque: disp.bloque_nombre,
          disp_aula: disp.aula_nombre,
          coincideDia,
          coincideBloque,
          coincideAula
        });
        
        return coincideDia && coincideBloque && coincideAula;
      });

      if (disponibilidad && disponibilidad.disponibilidad_aula_id) {
        console.log('Eliminando disponibilidad con ID:', disponibilidad.disponibilidad_aula_id);
        
        // CORREGIDO: Usar el ID correcto en la ruta
        await api.delete(`/api/disponibilidad-aulas/eliminar/${disponibilidad.disponibilidad_aula_id}`);
        console.log('Disponibilidad de aula eliminada exitosamente');
      } else {
        console.warn('No se encontró la disponibilidad específica para eliminar:', disponibilidad);
      }
    } catch (error) {
      console.error('Error eliminando disponibilidad de aula:', error);
    }
  };

  // Función para agregar aula a disponibilidad
  const addAulaToDisponibilidad = async (aulaId: number, diaId: number, bloqueId: number) => {
    try {
      console.log('Agregando aula a disponibilidad:', { aulaId, diaId, bloqueId });
      
      // Verificar que los parámetros sean válidos
      if (!aulaId || !diaId || !bloqueId) {
        console.error('Parámetros inválidos para agregar disponibilidad:', { aulaId, diaId, bloqueId });
        return;
      }

      const disponibilidadData = {
        aula_id: Number(aulaId),
        dia_id: Number(diaId),
        bloque_id: Number(bloqueId),
      };

      console.log('Enviando datos de disponibilidad:', disponibilidadData);
      
      const response = await api.post('/api/disponibilidad-aulas/registro', disponibilidadData);
      console.log('Respuesta de la API:', response.data);
      console.log('Aula agregada a disponibilidad exitosamente');
    } catch (error: any) {
      console.error('Error agregando aula a disponibilidad:', error);
      // Mostrar el error específico si está disponible
      if (error?.response?.data?.message) {
        console.error('Mensaje de error de la API:', error.response.data.message);
      }
    }
  };

  // CORREGIDO: Asignar horario y eliminar disponibilidad
  const handleAssignHorario = async (values: HorarioForm) => {
    try {
      if (!selectedCell) return;

      const horarioData = {
        ...values,
        dia_id: selectedCell.dia,
        bloque_id: selectedCell.bloque,
        profesor_id: profesores[tabValue]?.profesor_id,
      };

      console.log('Creando horario con datos:', horarioData);

      // Crear el horario
      await api.post('/api/horarios/registro', horarioData);

      // CORREGIDO: Eliminar el aula de disponibilidad usando el ID correcto
      await removeAulaFromDisponibilidad(values.aula_id, selectedCell.dia, selectedCell.bloque);

      // Recargar horarios
      const response = await api.get('/api/horarios/vista');
      setHorarios(response.data);

      setOpenAssignDialog(false);
      setSelectedCell(null);
      showSnackbar('Horario asignado exitosamente', 'success');
    } catch (error: any) {
      console.error('Error assigning horario:', error);
      
      // Manejar error 409 específicamente
      if (error?.response?.status === 409) {
        showSnackbar('Error: Aula no disponible para este bloque y día', 'error');
      } else if (error?.message) {
        showSnackbar(`Error al asignar horario: ${error.message}`, 'error');
      } else {
        showSnackbar('Error al asignar horario', 'error');
      }
    }
  };

  // Actualizar horario
  const handleUpdateHorario = async (values: any) => {
    try {
      if (!currentHorario) return;

      const aulaAnterior = currentHorario.aula_id;
      const aulaNueva = values.aula_id;

      console.log('Actualizando horario:', { aulaAnterior, aulaNueva, currentHorario });

      // Si cambió el aula, manejar disponibilidad
      if (aulaAnterior !== aulaNueva) {
        console.log('Cambió el aula, actualizando disponibilidades...');
        
        // Agregar el aula anterior a disponibilidad
        await addAulaToDisponibilidad(aulaAnterior, currentHorario.dia_id, currentHorario.bloque_id);
        
        // Eliminar la nueva aula de disponibilidad
        await removeAulaFromDisponibilidad(aulaNueva, currentHorario.dia_id, currentHorario.bloque_id);
      }

      // Actualizar el horario
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
    } catch (error: any) {
      console.error('Error updating horario:', error);
      
      // Manejar error 409 específicamente
      if (error?.response?.status === 409) {
        showSnackbar('Error: Aula no disponible para este bloque y día', 'error');
      } else if (error?.message) {
        showSnackbar(`Error al actualizar horario: ${error.message}`, 'error');
      } else {
        showSnackbar('Error al actualizar horario', 'error');
      }
    }
  };

  // CORREGIDO: Eliminar horario y restaurar disponibilidad
  const handleDeleteHorario = async (horario: Horario) => {
    try {
      console.log('Horario original recibido:', horario);

      // Enriquecer el horario con IDs faltantes
      const enrichedHorario = enrichHorarioWithIds(horario);
      console.log('Horario enriquecido con IDs:', enrichedHorario);

      // Verificar que el horario tenga los datos necesarios después del enriquecimiento
      if (!enrichedHorario.aula_id || !enrichedHorario.dia_id || !enrichedHorario.bloque_id) {
        console.error('Horario no tiene los datos necesarios para restaurar disponibilidad:', {
          aula_id: enrichedHorario.aula_id,
          dia_id: enrichedHorario.dia_id,
          bloque_id: enrichedHorario.bloque_id,
          aula_nombre: enrichedHorario.aula_nombre,
          dia_nombre: enrichedHorario.dia_nombre,
          bloque_nombre: enrichedHorario.bloque_nombre
        });
        showSnackbar('Error: No se pudieron obtener los datos necesarios del horario', 'error');
        return;
      }

      // Eliminar el horario primero
      console.log('Eliminando horario con ID:', enrichedHorario.horario_id);
      await api.delete(`/api/horarios/eliminar/${enrichedHorario.horario_id}`);
      console.log('Horario eliminado exitosamente');

      // Agregar el aula de vuelta a disponibilidad con los datos correctos
      console.log('Restaurando disponibilidad del aula:', {
        aula_id: enrichedHorario.aula_id,
        dia_id: enrichedHorario.dia_id,
        bloque_id: enrichedHorario.bloque_id
      });
      
      await addAulaToDisponibilidad(enrichedHorario.aula_id, enrichedHorario.dia_id, enrichedHorario.bloque_id);

      // Recargar horarios
      const response = await api.get('/api/horarios/vista');
      setHorarios(response.data);

      showSnackbar('Horario eliminado exitosamente', 'success');
    } catch (error: any) {
      console.error('Error deleting horario:', error);
      
      // Mostrar error específico si está disponible
      if (error?.response?.data?.message) {
        showSnackbar(`Error al eliminar horario: ${error.response.data.message}`, 'error');
      } else if (error?.message) {
        showSnackbar(`Error al eliminar horario: ${error.message}`, 'error');
      } else {
        showSnackbar('Error al eliminar horario', 'error');
      }
    }
  };

  // Función para exportar a PDF y almacenar en localStorage
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

      if (profesores[tabValue]) {
        pdf.setFontSize(16);
        pdf.text(`Horario - ${profesores[tabValue].nombre} ${profesores[tabValue].apellido}`, pdfWidth / 2, 30, { align: 'center' });
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

      // Generar el PDF como blob
      const pdfBlob = pdf.output('blob');
      
      // Crear nombre del archivo
      const profesorNombre = profesores[tabValue] ? `${profesores[tabValue].nombre}_${profesores[tabValue].apellido}` : 'general';
      const pdfName = `horario_${profesorNombre.replace(/\s+/g, '_').toLowerCase()}`;
      
      // Convertir blob a base64 para almacenar en localStorage
      const reader = new FileReader();
      reader.onload = function() {
        const base64data = reader.result as string;
        
        // Almacenar en localStorage
        try {
          localStorage.setItem(`pdf_${pdfName}`, base64data);
          
          // Crear URL del blob y abrir en nueva pestaña
          const pdfUrl = URL.createObjectURL(pdfBlob);
          const newWindow = window.open(pdfUrl, '_blank');
          
          if (newWindow) {
            newWindow.document.title = `${pdfName}.pdf`;
            showSnackbar('PDF generado y almacenado exitosamente', 'success');
          } else {
            showSnackbar('PDF generado pero no se pudo abrir en nueva pestaña', 'warning');
          }
          
          // Limpiar URL después de un tiempo
          setTimeout(() => {
            URL.revokeObjectURL(pdfUrl);
          }, 10000);
          
        } catch (error) {
          console.error('Error storing PDF in localStorage:', error);
          showSnackbar('PDF generado pero no se pudo almacenar localmente', 'warning');
          
          // Fallback: abrir en nueva pestaña sin almacenar
          const pdfUrl = URL.createObjectURL(pdfBlob);
          window.open(pdfUrl, '_blank');
        }
      };
      
      reader.readAsDataURL(pdfBlob);

    } catch (error) {
      console.error('Error generating PDF:', error);
      showSnackbar('Error al generar PDF', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  // Mostrar mensaje
  const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning') => {
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
          profesores={profesores}
          trayectos={trayectos}
          aulas={aulas}
          isExporting={isExporting}
          onExportPDF={handleExportPDF}
        />
      </Box>

      {/* Pestañas de profesores */}
      <Box sx={{ 
        width: '100%', 
        mb: { xs: 1, sm: 2 }
      }}>
        <HorarioTabs
          profesores={profesores}
          tabValue={tabValue}
          onTabChange={handleTabChange}
        />
      </Box>

      {/* Tabla de horarios */}
      <div ref={printRef} className="print-area">
        <HorarioTable
          profesores={profesores}
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
        trayectos={trayectos}
        trayectosUC={trayectosUC}
        aulas={aulas}
        diasSemana={diasSemana}
        bloquesHorarios={bloquesHorarios}
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