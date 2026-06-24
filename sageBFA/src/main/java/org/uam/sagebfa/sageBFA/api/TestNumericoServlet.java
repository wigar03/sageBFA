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

@WebServlet(urlPatterns = "/api/test-numerico/*")
public class TestNumericoServlet extends HttpServlet {

    private final EvaluacionService evaluacionService = new EvaluacionService();
    private final ObjectMapper mapper = new ObjectMapper();

    @Override
    protected void doOptions(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        setCorsHeaders(resp);
        resp.setStatus(HttpServletResponse.SC_OK);
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        setCorsHeaders(resp);
        
        String pathInfo = req.getPathInfo();
        // El GET solo se permite en la raíz del recurso /api/test-numerico
        if (pathInfo != null && !"/".equals(pathInfo) && !"".equals(pathInfo)) {
            resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
            resp.getWriter().write("{\"error\": \"Recurso no encontrado\"}");
            return;
        }

        EntityManager em = XPersistence.getManager();
        try {
            TestNumerico test = em.find(TestNumerico.class, 1L);
            if (test == null) {
                resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
                resp.setContentType("application/json;charset=UTF-8");
                resp.getWriter().write("{\"error\": \"Test Numérico (Factor N2) no está inicializado en el sistema.\"}");
                return;
            }

            // Agrupar preguntas por sección (Operaciones y Problemas) y ordenarlas
            List<PreguntaDTO> operaciones = new ArrayList<>();
            List<PreguntaDTO> problemas = new ArrayList<>();

            TypedQuery<Pregunta> pq = em.createQuery(
                "SELECT p FROM Pregunta p WHERE p.prueba.idPrueba = 1 ORDER BY p.seccion ASC, p.orden ASC",
                Pregunta.class
            );
            List<Pregunta> preguntas = pq.getResultList();

            for (Pregunta p : preguntas) {
                List<OpcionRespuestaDTO> opsDto = new ArrayList<>();
                for (OpcionRespuesta o : p.getOpciones()) {
                    opsDto.add(new OpcionRespuestaDTO(o.getId(), o.getLiteral(), o.getTextoOpcion()));
                }
                
                PreguntaDTO pDto = new PreguntaDTO(
                    p.getId(), 
                    p.getOrden(), 
                    p.getSeccion().name(), 
                    p.getEnunciado(), 
                    opsDto
                );

                if (p.getSeccion() == SeccionN2.OPERACIONES) {
                    operaciones.add(pDto);
                } else if (p.getSeccion() == SeccionN2.PROBLEMAS) {
                    problemas.add(pDto);
                }
            }

            TestNumericoDTO testDto = new TestNumericoDTO(
                test.getIdPrueba(),
                test.getNombre(),
                test.getTiempoLimiteMinutos(),
                test.getTiempoOperacionesMin(),
                test.getTiempoProblemasMin(),
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

    private void setCorsHeaders(HttpServletResponse resp) {
        resp.setHeader("Access-Control-Allow-Origin", "*");
        resp.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        resp.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    }
}
