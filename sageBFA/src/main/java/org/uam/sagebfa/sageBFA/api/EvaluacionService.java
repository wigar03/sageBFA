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

            // Cargar módulo dinámicamente basándose en codigoModulo (por defecto "N2")
            String codModulo = request.getCodigoModulo();
            if (codModulo == null || codModulo.trim().isEmpty()) {
                codModulo = "N2";
            }
            
            TypedQuery<ModuloPrueba> modQuery = em.createQuery(
                "SELECT m FROM ModuloPrueba m WHERE m.codigoModulo = :cod", ModuloPrueba.class
            );
            modQuery.setParameter("cod", codModulo);
            List<ModuloPrueba> modulos = modQuery.getResultList();
            if (modulos.isEmpty()) {
                throw new IllegalArgumentException("Módulo de prueba no encontrado con código: " + codModulo);
            }
            ModuloPrueba modulo = modulos.get(0);

            if (candidato.getId() == null) {
                em.persist(candidato);
            } else {
                candidato = em.merge(candidato);
                
                // Limpiar intentos anteriores de este módulo específico para evitar inconsistencias
                em.createQuery("DELETE FROM IntentoEvaluacion i WHERE i.candidato.id = :cId AND i.moduloPrueba.id = :modId")
                  .setParameter("cId", candidato.getId())
                  .setParameter("modId", modulo.getId())
                  .executeUpdate();
            }

            // B. Crear Intento de Evaluación
            IntentoEvaluacion intento = new IntentoEvaluacion();
            intento.setCandidato(candidato);
            intento.setModuloPrueba(modulo);
            intento.setFechaHora(new java.util.Date());

            // C. Procesar cada respuesta, calculando puntuación directa
            int aciertos = 0;
            if (request.getRespuestas() != null) {
                for (RespuestaRequestDTO respDto : request.getRespuestas()) {
                    Pregunta pregunta = em.find(Pregunta.class, respDto.getPreguntaId());
                    if (pregunta == null) {
                        continue;
                    }

                    OpcionRespuesta opcion = null;
                    Long opcionId = respDto.getOpcionElegidaId();
                    if (opcionId != null && opcionId > 0) {
                        opcion = em.find(OpcionRespuesta.class, opcionId);
                    }

                    RespuestaCandidato respuesta = new RespuestaCandidato();
                    respuesta.setPregunta(pregunta);
                    respuesta.setOpcionElegida(opcion);
                    respuesta.setTiempoSegundos(respDto.getTiempoSegundos() != null ? respDto.getTiempoSegundos() : 0);
                    
                    // Asociar bidireccionalmente al intento (se guarda en cascada)
                    intento.agregarRespuesta(respuesta);

                    // Regla de calificación: acierto si la opción elegida es correcta
                    if (opcion != null && Boolean.TRUE.equals(opcion.getEsCorrecta())) {
                        aciertos++;
                    }
                }
            }

            // D. Determinar el Percentil buscando en BaremoNacional del módulo correspondiente
            TypedQuery<BaremoNacional> baremoQuery = em.createQuery(
                "SELECT b FROM BaremoNacional b WHERE b.moduloPrueba.id = :modId AND :aciertos >= b.puntuacionDirectaMinima AND :aciertos <= b.puntuacionDirectaMaxima",
                BaremoNacional.class
            );
            baremoQuery.setParameter("modId", modulo.getId());
            baremoQuery.setParameter("aciertos", aciertos);
            List<BaremoNacional> baremos = baremoQuery.getResultList();

            BaremoNacional baremoAplicado = null;
            Integer percentil = 0;

            if (!baremos.isEmpty()) {
                baremoAplicado = baremos.get(0);
                percentil = baremoAplicado.getPercentil();
            } else {
                // Fallbacks para límites fuera de rango
                if (aciertos > 16) {
                    percentil = 99;
                    TypedQuery<BaremoNacional> maxBaremoQuery = em.createQuery(
                        "SELECT b FROM BaremoNacional b WHERE b.moduloPrueba.id = :modId ORDER BY b.percentil DESC", BaremoNacional.class
                    );
                    maxBaremoQuery.setParameter("modId", modulo.getId());
                    maxBaremoQuery.setMaxResults(1);
                    List<BaremoNacional> maxBaremos = maxBaremoQuery.getResultList();
                    if (!maxBaremos.isEmpty()) {
                        baremoAplicado = maxBaremos.get(0);
                    }
                } else {
                    percentil = 1;
                    TypedQuery<BaremoNacional> minBaremoQuery = em.createQuery(
                        "SELECT b FROM BaremoNacional b WHERE b.moduloPrueba.id = :modId ORDER BY b.percentil ASC", BaremoNacional.class
                    );
                    minBaremoQuery.setParameter("modId", modulo.getId());
                    minBaremoQuery.setMaxResults(1);
                    List<BaremoNacional> minBaremos = minBaremoQuery.getResultList();
                    if (!minBaremos.isEmpty()) {
                        baremoAplicado = minBaremos.get(0);
                    }
                }
            }

            // E. Asignar puntuaciones y diagnóstico cualitativo
            intento.setPuntuacionDirecta(aciertos);
            intento.setPercentil(percentil);
            intento.setBaremoAplicado(baremoAplicado);

            String diagnostico = "Medio";
            if (aciertos <= 10) {
                switch (aciertos) {
                    case 0: diagnostico = "Deficiente"; break;
                    case 1:
                    case 2: diagnostico = "Inferior"; break;
                    case 3: diagnostico = "Medio Bajo"; break;
                    case 4: diagnostico = "Medio"; break;
                    case 5: diagnostico = "Medio Alto"; break;
                    case 6:
                    case 7: diagnostico = "Superior"; break;
                    default: diagnostico = "Muy Superior"; break;
                }
            } else {
                diagnostico = "Excelente";
            }
            intento.setDiagnostico(diagnostico);

            // Persistir el intento (las respuestas se guardan en cascada)
            em.persist(intento);

            // F. Comprometer la transacción
            XPersistence.commit();

            // G. Mapear al DTO de respuesta
            return ResultadoResponseDTO.builder()
                .id(intento.getId())
                .candidatoNombres(candidato.getNombres())
                .candidatoApellidos(candidato.getApellidos())
                .candidatoCorreo(candidato.getCorreo())
                .puntuacionDirecta(intento.getPuntuacionDirecta())
                .percentil(intento.getPercentil())
                .fechaEvaluacion(new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(intento.getFechaHora()))
                .nombrePrueba(modulo.getNombre())
                .build();

        } catch (Exception e) {
            XPersistence.rollback();
            throw new RuntimeException("Error al evaluar la prueba de aptitud N2: " + e.getMessage(), e);
        }
    }
}
