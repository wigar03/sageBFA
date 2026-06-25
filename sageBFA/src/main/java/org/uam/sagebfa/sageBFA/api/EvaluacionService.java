package org.uam.sagebfa.sageBFA.api;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import javax.persistence.EntityManager;
import javax.persistence.TypedQuery;
import org.openxava.jpa.XPersistence;
import org.uam.sagebfa.sageBFA.api.dto.EvaluacionRequestDTO;
import org.uam.sagebfa.sageBFA.api.dto.RespuestaRequestDTO;
import org.uam.sagebfa.sageBFA.api.dto.ResultadoResponseDTO;
import org.uam.sagebfa.sageBFA.model.*;

public class EvaluacionService {

    public ResultadoResponseDTO evaluar(EvaluacionRequestDTO request) {
        if (request.getAceptoConsentimientoInformado() == null || !request.getAceptoConsentimientoInformado()) {
            throw new IllegalArgumentException("El candidato debe aceptar el consentimiento informado para realizar la prueba.");
        }

        // Obtener el EntityManager administrado por OpenXava (inicia transacción automáticamente)
        EntityManager em = XPersistence.getManager();

        try {
            // A. Buscar candidato por correo o registrar uno nuevo
            Candidato candidato = null;
            TypedQuery<Candidato> q = em.createQuery(
                "SELECT c FROM Candidato c WHERE c.correo = :correo", Candidato.class
            );
            q.setParameter("correo", request.getCorreo());
            List<Candidato> existing = q.getResultList();

            if (!existing.isEmpty()) {
                candidato = existing.get(0);
            } else {
                candidato = new Candidato();
                candidato.setCorreo(request.getCorreo());
            }

            candidato.setNombres(request.getNombres());
            candidato.setApellidos(request.getApellidos());
            candidato.setFechaNacimiento(LocalDate.parse(request.getFechaNacimiento()));
            candidato.setSexo(Sexo.valueOf(request.getSexo().toUpperCase()));
            candidato.setNivelEstudio(NivelEstudio.valueOf(request.getNivelEstudio().toUpperCase()));
            candidato.setAceptoConsentimientoInformado(request.getAceptoConsentimientoInformado());
            candidato.setCedula(request.getCedula());
            candidato.setEdad(request.getEdad());
            candidato.setTelefono(request.getTelefono());
            candidato.setDepartamento(request.getDepartamento());
            candidato.setMunicipio(request.getMunicipio());
            candidato.setTipoColegio(request.getTipoColegio());

            if (candidato.getId() == null) {
                em.persist(candidato);
            } else {
                candidato = em.merge(candidato);
                
                // Limpiar respuestas e intentos anteriores para evitar duplicados o inconsistencias
                em.createQuery("DELETE FROM ResultadoN2 r WHERE r.candidato.id = :cId")
                  .setParameter("cId", candidato.getId())
                  .executeUpdate();

                em.createQuery("DELETE FROM RespuestaCandidato r WHERE r.candidato.id = :cId")
                  .setParameter("cId", candidato.getId())
                  .executeUpdate();
            }

            // B. Procesar e insertar cada respuesta, calculando puntuación directa
            int aciertos = 0;
            if (request.getRespuestas() != null) {
                for (RespuestaRequestDTO respDto : request.getRespuestas()) {
                    Pregunta pregunta = em.find(Pregunta.class, respDto.getPreguntaId());
                    if (pregunta == null) {
                        continue;
                    }

                    OpcionRespuesta opcion = null;
                    Long opcionId = respDto.getOpcionElegidaId();
                    // Defensa: solo buscar en la base de datos si el ID no es nulo y es mayor que cero
                    if (opcionId != null && opcionId > 0) {
                        opcion = em.find(OpcionRespuesta.class, opcionId);
                    }

                    RespuestaCandidato respuesta = new RespuestaCandidato();
                    respuesta.setCandidato(candidato);
                    respuesta.setPregunta(pregunta);
                    respuesta.setOpcionElegida(opcion);
                    respuesta.setTiempoSegundos(respDto.getTiempoSegundos() != null ? respDto.getTiempoSegundos() : 0);
                    em.persist(respuesta);

                    // Regla de calificación: Solo suma si la opción elegida es correcta
                    if (opcion != null && Boolean.TRUE.equals(opcion.getEsCorrecta())) {
                        aciertos++;
                    }
                }
            }

            // C. Determinar el Percentil buscando en BaremoNacional
            TypedQuery<BaremoNacional> baremoQuery = em.createQuery(
                "SELECT b FROM BaremoNacional b WHERE :aciertos >= b.puntuacionDirectaMinima AND :aciertos <= b.puntuacionDirectaMaxima",
                BaremoNacional.class
            );
            baremoQuery.setParameter("aciertos", aciertos);
            List<BaremoNacional> baremos = baremoQuery.getResultList();

            BaremoNacional baremoAplicado = null;
            Integer percentil = 0;

            if (!baremos.isEmpty()) {
                baremoAplicado = baremos.get(0);
                percentil = baremoAplicado.getPercentil();
            } else {
                // Fallbacks para límites fuera de rango del baremo
                if (aciertos > 16) {
                    percentil = 99;
                    TypedQuery<BaremoNacional> maxBaremoQuery = em.createQuery(
                        "SELECT b FROM BaremoNacional b ORDER BY b.percentil DESC", BaremoNacional.class
                    );
                    maxBaremoQuery.setMaxResults(1);
                    List<BaremoNacional> maxBaremos = maxBaremoQuery.getResultList();
                    if (!maxBaremos.isEmpty()) {
                        baremoAplicado = maxBaremos.get(0);
                    }
                } else {
                    percentil = 1;
                    TypedQuery<BaremoNacional> minBaremoQuery = em.createQuery(
                        "SELECT b FROM BaremoNacional b ORDER BY b.percentil ASC", BaremoNacional.class
                    );
                    minBaremoQuery.setMaxResults(1);
                    List<BaremoNacional> minBaremos = minBaremoQuery.getResultList();
                    if (!minBaremos.isEmpty()) {
                        baremoAplicado = minBaremos.get(0);
                    }
                }
            }

            // D. Obtener Prueba y Registrar ResultadoN2
            TestNumerico test = em.find(TestNumerico.class, 1L);
            if (test == null) {
                throw new IllegalStateException("Test Numérico con ID 1 no inicializado en la base de datos.");
            }

            ResultadoN2 resultado = new ResultadoN2();
            resultado.setCandidato(candidato);
            resultado.setTestNumerico(test);
            resultado.setPuntuacionDirecta(aciertos);
            resultado.setPercentil(percentil);
            resultado.setBaremoAplicado(baremoAplicado);
            resultado.setFechaEvaluacion(LocalDateTime.now());
            em.persist(resultado);

            // E. Comprometer la transacción
            XPersistence.commit();

            // F. Mapear al DTO de respuesta
            return ResultadoResponseDTO.builder()
                .id(resultado.getId())
                .candidatoNombres(candidato.getNombres())
                .candidatoApellidos(candidato.getApellidos())
                .candidatoCorreo(candidato.getCorreo())
                .puntuacionDirecta(resultado.getPuntuacionDirecta())
                .percentil(resultado.getPercentil())
                .fechaEvaluacion(resultado.getFechaEvaluacion().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")))
                .nombrePrueba(test.getNombre())
                .build();

        } catch (Exception e) {
            XPersistence.rollback();
            throw new RuntimeException("Error al evaluar la prueba de aptitud N2: " + e.getMessage(), e);
        }
    }
}
