package org.uam.sagebfa.sageBFA.api;

import java.io.BufferedReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import javax.persistence.EntityManager;
import javax.persistence.TypedQuery;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.openxava.jpa.XPersistence;
import org.uam.sagebfa.sageBFA.api.dto.*;
import org.uam.sagebfa.sageBFA.model.*;

// Imports de OpenPDF para reportes clínicos
import com.lowagie.text.*;
import com.lowagie.text.pdf.*;

@WebServlet(urlPatterns = "/api/test-numerico/*")
public class TestNumericoServlet extends HttpServlet {

    private final EvaluacionService evaluacionService = new EvaluacionService();
    private final ObjectMapper mapper = new ObjectMapper();
    private static volatile boolean menuCleaned = false;

    private void cleanNavioxMenu() {
        if (menuCleaned) return;
        synchronized (TestNumericoServlet.class) {
            if (menuCleaned) return;
            EntityManager em = XPersistence.getManager();
            try {
                em.getTransaction().begin();
                String[] joinTables = {"oxroles_modules", "oxmodules_roles", "oxroles_oxmodules", "oxmodules_oxroles"};
                for (String table : joinTables) {
                    try {
                        em.createNativeQuery("DELETE FROM " + table + " WHERE module_name IN ('Pregunta', 'BaremoNacional', 'Psicologo', 'UsuarioAdministrativo', 'OpcionRespuesta', 'RespuestaCandidato', 'Usuario')").executeUpdate();
                    } catch (Exception e) {
                        // Ignorar
                    }
                }
                try {
                    em.createNativeQuery("DELETE FROM oxmodules WHERE name IN ('Pregunta', 'BaremoNacional', 'Psicologo', 'UsuarioAdministrativo', 'OpcionRespuesta', 'RespuestaCandidato', 'Usuario')").executeUpdate();
                } catch (Exception e) {
                    // Ignorar
                }
                em.getTransaction().commit();
                menuCleaned = true;
                System.out.println("[NaviOX Cleanup] Módulos obsoletos limpiados con éxito de la base de datos.");
            } catch (Exception ex) {
                try {
                    if (em.getTransaction().isActive()) {
                        em.getTransaction().rollback();
                    }
                } catch (Exception e) {
                    // Ignorar
                }
                System.out.println("[NaviOX Cleanup] Advertencia durante la limpieza: " + ex.getMessage());
            }
        }
    }

    @Override
    protected void doOptions(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        setCorsHeaders(resp);
        resp.setStatus(HttpServletResponse.SC_OK);
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        cleanNavioxMenu();
        setCorsHeaders(resp);
        
        String pathInfo = req.getPathInfo();
        
        // Enrutar la descarga del reporte clínico PDF
        if (pathInfo != null && ("/reporte".equals(pathInfo) || "/reporte/".equals(pathInfo))) {
            generateReporteClinico(req, resp);
            return;
        }
        
        // El GET de preguntas solo se permite en la raíz del recurso /api/test-numerico
        if (pathInfo != null && !"/".equals(pathInfo) && !"".equals(pathInfo)) {
            resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
            resp.getWriter().write("{\"error\": \"Recurso no encontrado\"}");
            return;
        }

        EntityManager em = XPersistence.getManager();
        try {
            TypedQuery<ModuloPrueba> mq = em.createQuery(
                "SELECT m FROM ModuloPrueba m WHERE m.codigoModulo = 'N2'", ModuloPrueba.class
            );
            List<ModuloPrueba> modulos = mq.getResultList();
            if (modulos.isEmpty()) {
                resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
                resp.setContentType("application/json;charset=UTF-8");
                resp.getWriter().write("{\"error\": \"Módulo N2 no está inicializado en el sistema.\"}");
                return;
            }
            ModuloPrueba modulo = modulos.get(0);

            // Agrupar preguntas por sección (Operaciones y Problemas) y ordenarlas
            List<PreguntaDTO> operaciones = new ArrayList<>();
            List<PreguntaDTO> problemas = new ArrayList<>();

            TypedQuery<Pregunta> pq = em.createQuery(
                "SELECT p FROM Pregunta p WHERE p.moduloPrueba.id = :modId ORDER BY p.seccion ASC, p.orden ASC",
                Pregunta.class
            );
            pq.setParameter("modId", modulo.getId());
            List<Pregunta> preguntas = pq.getResultList();

            for (Pregunta p : preguntas) {
                List<OpcionRespuestaDTO> opsDto = new ArrayList<>();
                for (OpcionRespuesta o : p.getOpciones()) {
                    opsDto.add(new OpcionRespuestaDTO(o.getId(), o.getLiteral(), o.getTextoOpcion()));
                }
                
                PreguntaDTO pDto = new PreguntaDTO(
                    p.getId(), 
                    p.getOrden(), 
                    p.getSeccion(), 
                    p.getEnunciado(), 
                    opsDto
                );

                if ("OPERACIONES".equalsIgnoreCase(p.getSeccion())) {
                    operaciones.add(pDto);
                } else if ("PROBLEMAS".equalsIgnoreCase(p.getSeccion())) {
                    problemas.add(pDto);
                }
            }

            TestNumericoDTO testDto = new TestNumericoDTO(
                modulo.getId(),
                modulo.getNombre(),
                modulo.getTiempoLimiteMinutos(),
                6, // Tiempo de operaciones por defecto
                6, // Tiempo de problemas por defecto
                operaciones,
                problemas
            );

            // Cerrar la transacción de lectura de OpenXava
            XPersistence.commit();

            resp.setContentType("application/json;charset=UTF-8");
            resp.setStatus(HttpServletResponse.SC_OK);
            resp.getWriter().write(mapper.writeValueAsString(testDto));

        } catch (Exception e) {
            XPersistence.rollback();
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            resp.setContentType("application/json;charset=UTF-8");
            resp.getWriter().write("{\"error\": \"Error al consultar las preguntas del test: " + e.getMessage() + "\"}");
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        cleanNavioxMenu();
        setCorsHeaders(resp);
        
        String pathInfo = req.getPathInfo();
        if (pathInfo == null || (!"/evaluar".equals(pathInfo) && !"/evaluar/".equals(pathInfo))) {
            resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
            resp.getWriter().write("{\"error\": \"Endpoint no encontrado\"}");
            return;
        }

        StringBuilder buffer = new StringBuilder();
        String line;
        try (BufferedReader reader = req.getReader()) {
            while ((line = reader.readLine()) != null) {
                buffer.append(line);
            }
        }

        try {
            EvaluacionRequestDTO evalRequest = mapper.readValue(buffer.toString(), EvaluacionRequestDTO.class);
            ResultadoResponseDTO responseDto = evaluacionService.evaluar(evalRequest);
            
            resp.setContentType("application/json;charset=UTF-8");
            resp.setStatus(HttpServletResponse.SC_OK);
            resp.getWriter().write(mapper.writeValueAsString(responseDto));

        } catch (IllegalArgumentException e) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            resp.setContentType("application/json;charset=UTF-8");
            resp.getWriter().write("{\"error\": \"" + e.getMessage() + "\"}");
        } catch (Exception e) {
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            resp.setContentType("application/json;charset=UTF-8");
            resp.getWriter().write("{\"error\": \"Error al procesar la evaluación: " + e.getMessage() + "\"}");
        }
    }

    private void generateReporteClinico(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String idStr = req.getParameter("id");
        if (idStr == null || idStr.trim().isEmpty()) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            resp.getWriter().write("{\"error\": \"Falta el ID del candidato\"}");
            return;
        }

        Long candidatoId;
        try {
            candidatoId = Long.parseLong(idStr);
        } catch (NumberFormatException e) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            resp.getWriter().write("{\"error\": \"ID de candidato inválido\"}");
            return;
        }

        EntityManager em = XPersistence.getManager();
        try {
            Candidato candidato = em.find(Candidato.class, candidatoId);
            if (candidato == null) {
                resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
                resp.getWriter().write("{\"error\": \"Candidato no encontrado\"}");
                return;
            }

            // Buscar el último intento de evaluación para el módulo N2 en la colección del candidato
            IntentoEvaluacion intento = null;
            if (candidato.getIntentos() != null) {
                for (IntentoEvaluacion i : candidato.getIntentos()) {
                    if (i.getModuloPrueba() != null && "N2".equals(i.getModuloPrueba().getCodigoModulo())) {
                        if (intento == null || i.getFechaHora().after(intento.getFechaHora())) {
                            intento = i;
                        }
                    }
                }
            }

            // Variables con valores por defecto (Null-Safety)
            String codigoModulo = "N2";
            String puntuacionDirecta = "0";
            String percentilStr = "N/A";
            String diagnostico = "Sin evaluar";

            if (intento != null) {
                if (intento.getModuloPrueba() != null) {
                    codigoModulo = intento.getModuloPrueba().getCodigoModulo();
                }
                if (intento.getPuntuacionDirecta() != null) {
                    puntuacionDirecta = String.valueOf(intento.getPuntuacionDirecta());
                }
                if (intento.getPercentil() != null) {
                    percentilStr = String.valueOf(intento.getPercentil());
                }
                if (intento.getDiagnostico() != null) {
                    diagnostico = intento.getDiagnostico();
                }
            }

            // Generar PDF usando OpenPDF
            resp.setContentType("application/pdf");
            resp.setHeader("Content-Disposition", "inline; filename=\"reporte_clinico_" + candidato.getCedula() + ".pdf\"");

            Document document = new Document(PageSize.LETTER, 36, 36, 54, 36);
            PdfWriter.getInstance(document, resp.getOutputStream());

            document.open();

            // 0. Logo de la Universidad Americana (UAM)
            try {
                java.net.URL logoUrl = getServletContext().getResource("/images/logo_uam.png");
                if (logoUrl != null) {
                    Image logo = Image.getInstance(logoUrl);
                    logo.scaleToFit(120, 120);
                    logo.setAlignment(Element.ALIGN_CENTER);
                    logo.setSpacingAfter(15);
                    document.add(logo);
                } else {
                    System.out.println("[Advertencia] No se encontró el logo de la UAM en /images/logo_uam.png");
                }
            } catch (Exception e) {
                System.err.println("[Error] Fallo al intentar cargar e incrustar el logo en el PDF: " + e.getMessage());
            }

            // 1. Título
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16);
            Paragraph title = new Paragraph("REPORTE PSICOMÉTRICO - BATERÍA FACTORIAL DE APTITUDES (B.F.A.)", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(5);
            document.add(title);

            // 2. Subtítulo
            Font subTitleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
            Paragraph subtitle = new Paragraph("Área Numérica - Factor " + codigoModulo, subTitleFont);
            subtitle.setAlignment(Element.ALIGN_CENTER);
            subtitle.setSpacingAfter(25);
            document.add(subtitle);

            // 3. Datos Demográficos
            Font sectionFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
            Paragraph sectionDemo = new Paragraph("1. Datos Demográficos del Candidato", sectionFont);
            sectionDemo.setSpacingAfter(10);
            document.add(sectionDemo);

            Font bodyFont = FontFactory.getFont(FontFactory.HELVETICA, 10);
            
            PdfPTable demoTable = new PdfPTable(2);
            demoTable.setWidthPercentage(100);
            demoTable.setSpacingAfter(20);
            
            demoTable.addCell(new Phrase("Nombre Completo:", bodyFont));
            demoTable.addCell(new Phrase(candidato.getNombreCompleto(), bodyFont));
            
            demoTable.addCell(new Phrase("Cédula de Identidad:", bodyFont));
            demoTable.addCell(new Phrase(candidato.getCedula(), bodyFont));
            
            demoTable.addCell(new Phrase("Edad:", bodyFont));
            demoTable.addCell(new Phrase(String.valueOf(candidato.getEdad()) + " años", bodyFont));
            
            demoTable.addCell(new Phrase("Departamento:", bodyFont));
            demoTable.addCell(new Phrase(candidato.getDepartamento(), bodyFont));
            
            demoTable.addCell(new Phrase("Municipio:", bodyFont));
            demoTable.addCell(new Phrase(candidato.getMunicipio(), bodyFont));
            
            demoTable.addCell(new Phrase("Tipo de Colegio:", bodyFont));
            demoTable.addCell(new Phrase(candidato.getTipoColegio(), bodyFont));
            
            document.add(demoTable);

            // 4. Resultados
            Paragraph sectionResult = new Paragraph("2. Resultados de la Prueba", sectionFont);
            sectionResult.setSpacingAfter(10);
            document.add(sectionResult);

            PdfPTable resultTable = new PdfPTable(3);
            resultTable.setWidthPercentage(100);
            resultTable.setSpacingAfter(20);

            resultTable.addCell(new Phrase("Puntuación Final (Aciertos)", sectionFont));
            resultTable.addCell(new Phrase("Percentil", sectionFont));
            resultTable.addCell(new Phrase("Diagnóstico Clínico", sectionFont));

            resultTable.addCell(new Phrase(puntuacionDirecta + " / 20", bodyFont));
            resultTable.addCell(new Phrase(percentilStr, bodyFont));
            resultTable.addCell(new Phrase(diagnostico, bodyFont));

            document.add(resultTable);

            // 5. Interpretación Clínica
            Paragraph sectionInterpret = new Paragraph("3. Interpretación Diagnóstica", sectionFont);
            sectionInterpret.setSpacingAfter(10);
            document.add(sectionInterpret);
            String interpretacionText = "";
            if ("Deficiente".equals(diagnostico) || "Inferior".equals(diagnostico) || "Medio Bajo".equals(diagnostico)) {
                interpretacionText = "El candidato presenta un rendimiento en el Factor N2 que se sitúa por debajo del promedio esperado. Este déficit en aptitudes numéricas puede ser la resultante de una integración insuficiente de los aprendizajes elementales, o bien de posibles inhibiciones psicopedagógicas frente a los sistemas de numeración y trastornos del ritmo, según los lineamientos del manual del test. Se recomienda nivelación y apoyo pedagógico enfocado.";
            } else if ("Medio".equals(diagnostico) || "Medio Alto".equals(diagnostico)) {
                interpretacionText = "El candidato posee un rendimiento promedio en la manipulación y comprensión del factor numérico, evidenciando un manejo adecuado de esquemas anticipatorios básicos. Esto le faculta para resolver de forma satisfactoria operaciones matemáticas cotidianas, cálculo conceptual básico y problemas de razonamiento aritmético estándar.";
            } else { // Superior, Muy Superior, Excelente
                interpretacionText = "El candidato muestra un desempeño sobresaliente en la prueba. Posee una alta aptitud para manipular números rápidamente, precisión excepcional en el cálculo mental y conceptual, y una capacidad superior para el razonamiento matemático y resolución de problemas de alta complejidad. Su perfil cognitivo en el área cuantitativa es sumamente competitivo.";
            }

            Paragraph interpretParagraph = new Paragraph(interpretacionText, bodyFont);
            interpretParagraph.setLeading(14);
            interpretParagraph.setAlignment(Element.ALIGN_JUSTIFIED);
            document.add(interpretParagraph);

            document.close();

            // Cerrar la transacción de lectura de OpenXava una vez completada la generación del reporte
            XPersistence.commit();

        } catch (Exception e) {
            e.printStackTrace();
            XPersistence.rollback();
            if (!resp.isCommitted()) {
                resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                resp.setContentType("application/json;charset=UTF-8");
                try {
                    resp.getWriter().write("{\"error\": \"Error al generar el reporte: " + e.getMessage() + "\"}");
                } catch (IllegalStateException ise) {
                    resp.getOutputStream().write(("{\"error\": \"Error al generar el reporte: " + e.getMessage() + "\"}").getBytes());
                }
            }
        }
    }

    private void setCorsHeaders(HttpServletResponse resp) {
        resp.setHeader("Access-Control-Allow-Origin", "*");
        resp.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        resp.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    }
}
