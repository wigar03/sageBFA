package org.uam.sagebfa.sageBFA.model;

import javax.persistence.*;

import org.openxava.annotations.*;

import lombok.*;

/**
 * Entidad que registra la respuesta de un candidato a una pregunta específica.
 * <p>
 * Almacena la opción elegida y el tiempo que el candidato tardó en responder
 * esa pregunta particular (en segundos). Un candidato puede tener múltiples
 * registros de respuesta, uno por cada pregunta contestada.
 * </p>
 *
 * @author SageBFA Team
 */
@Entity
@Getter @Setter
@Tab(properties = "intento.candidato.correo, intento.moduloPrueba.codigoModulo, pregunta.enunciado, opcionElegida.literal, tiempoSegundos")
public class RespuestaCandidato {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Hidden
    private Long id;

    /** Intento de evaluación al que pertenece esta respuesta. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "intento_id", nullable = false)
    @Required
    @NoCreate @NoModify
    @DescriptionsList(descriptionProperties = "id")
    private IntentoEvaluacion intento;

    /** Pregunta a la que corresponde esta respuesta. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pregunta_id", nullable = false)
    @Required
    @NoCreate @NoModify
    @DescriptionsList(descriptionProperties = "enunciado")
    private Pregunta pregunta;

    /** Opción seleccionada por el candidato (puede ser {@code null} si no respondió). */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "opcion_elegida_id")
    @NoCreate @NoModify
    @DescriptionsList(descriptionProperties = "literal, textoOpcion")
    private OpcionRespuesta opcionElegida;

    /** Tiempo invertido por el candidato en esta pregunta (en segundos). */
    @Column(nullable = false)
    @Required
    private Integer tiempoSegundos;

    // ──────────────────────────────────────────────
    //  Métodos de consulta
    // ──────────────────────────────────────────────

    /**
     * Verifica si la opción elegida por el candidato es la correcta.
     *
     * @return {@code true} si la opción elegida es la correcta,
     *         {@code false} si es incorrecta o no se eligió ninguna
     */
    public boolean esAcierto() {
        return opcionElegida != null && opcionElegida.getEsCorrecta();
    }

    public void setIntentoEvaluacion(IntentoEvaluacion intento) {
        this.intento = intento;
    }

    public IntentoEvaluacion getIntentoEvaluacion() {
        return this.intento;
    }
}
