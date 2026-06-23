package org.uam.sagebfa.sageBFA.model;

import java.util.*;

import javax.persistence.*;

import org.openxava.annotations.*;

import lombok.*;

/**
 * Entidad concreta que implementa el Factor N2 (Operaciones y Problemas numéricos).
 * <p>
 * Regla de calificación N2: La Puntuación Directa se calcula sumando
 * <strong>únicamente</strong> el número de aciertos. No hay penalización por
 * respuestas erróneas ni por preguntas sin contestar.
 * </p>
 * <p>
 * La prueba se compone de dos sub-secciones con temporizador independiente:
 * <ul>
 *   <li><strong>Operaciones</strong>: 6 minutos exactos.</li>
 *   <li><strong>Problemas</strong>: 6 minutos exactos.</li>
 * </ul>
 * El tiempo total por defecto es 12 minutos (la suma de ambas secciones),
 * aunque el control del temporizador es responsabilidad del frontend.
 * </p>
 *
 * @author SageBFA Team
 */
@Entity
@DiscriminatorValue("TEST_NUMERICO")
@Getter @Setter
@Tab(properties = "nombre, tiempoLimiteMinutos, tiempoOperacionesMin, tiempoProblemasMin")
public class TestNumerico extends PruebaAptitud {

    /** Tiempo límite para la sección de Operaciones (por defecto 6 min). */
    @Column(nullable = false)
    private Integer tiempoOperacionesMin = 6;

    /** Tiempo límite para la sección de Problemas (por defecto 6 min). */
    @Column(nullable = false)
    private Integer tiempoProblemasMin = 6;

    // ──────────────────────────────────────────────
    //  Implementación polimórfica de calificación
    // ──────────────────────────────────────────────

    /**
     * Calcula la Puntuación Directa (P.D.) para el Factor N2.
     * <p>
     * Regla: se suman únicamente los aciertos. No se penalizan errores.
     * Se valida que cada respuesta corresponda a una pregunta de esta prueba.
     * </p>
     *
     * @param respuestas lista de {@link RespuestaCandidato} a evaluar
     * @return número total de respuestas correctas (P.D.)
     */
    @Override
    public int calcularPuntuacionDirecta(List<RespuestaCandidato> respuestas) {
        if (respuestas == null || respuestas.isEmpty()) {
            return 0;
        }

        int aciertos = 0;
        for (RespuestaCandidato respuesta : respuestas) {
            if (respuesta.getOpcionElegida() != null
                    && respuesta.getOpcionElegida().getEsCorrecta()) {
                aciertos++;
            }
        }
        return aciertos;
    }
}
