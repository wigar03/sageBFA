package org.uam.sagebfa.sageBFA.model;

import javax.persistence.*;

import org.openxava.annotations.*;

import lombok.*;

/**
 * Entidad que modela una opción de respuesta (A, B, C o D) para una pregunta.
 * <p>
 * El campo {@code esCorrecta} está <strong>estrictamente encapsulado</strong>:
 * solo es accesible mediante su getter, y la API REST nunca debe exponer este
 * valor al frontend durante la sesión de evaluación. El setter existe solo
 * para uso administrativo (CRUD de OpenXava) y persistencia JPA.
 * </p>
 *
 * @author SageBFA Team
 */
@Entity
@Getter @Setter
@Tab(properties = "literal, textoOpcion, esCorrecta")
public class OpcionRespuesta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Hidden
    private Long id;

    /**
     * Literal identificador de la opción (A, B, C, D).
     * Se utiliza como referencia rápida y para serialización JSON.
     */
    @Column(nullable = false, length = 1)
    @Required
    private String literal;

    /** Texto descriptivo de esta opción de respuesta. */
    @Column(nullable = false, length = 500)
    @Required
    private String textoOpcion;

    /**
     * Indica si esta opción es la respuesta correcta.
     * <p>
     * <strong>Encapsulamiento:</strong> Este campo NO debe ser serializado
     * al frontend durante la evaluación. Solo se usa internamente para
     * la calificación en {@link TestNumerico#calcularPuntuacionDirecta}.
     * </p>
     */
    @Column(nullable = false)
    private Boolean esCorrecta = false;

    /** Pregunta a la que pertenece esta opción (relación inversa). */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pregunta_id", nullable = false)
    @Required
    @NoCreate @NoModify
    @DescriptionsList(descriptionProperties = "enunciado")
    private Pregunta pregunta;
}
