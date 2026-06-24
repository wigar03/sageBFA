package org.uam.sagebfa.sageBFA.model;

import java.time.LocalDateTime;

import javax.persistence.*;

import org.openxava.annotations.*;

import lombok.*;

/**
 * Entidad que almacena el resultado final de la evaluación del Factor N2
 * para un candidato específico.
 * <p>
 * Contiene la Puntuación Directa (P.D.) calculada por
 * {@link TestNumerico#calcularPuntuacionDirecta} y el Percentil obtenido
 * al consultar el {@link BaremoNacional}. Se genera al finalizar la evaluación
 * (cuando ambos temporizadores han expirado o el candidato ha completado
 * todas las preguntas).
 * </p>
 *
 * @author SageBFA Team
 */
@Entity
@Getter @Setter
@Tab(properties = "candidato.correo, candidato.nombres, puntuacionDirecta, percentil")
@View(members = ""
    + "Evaluación {"
    + "  candidato; testNumerico"
    + "}"
    + "Resultados {"
    + "  puntuacionDirecta; percentil;"
    + "  baremoAplicado"
    + "}"
)
public class ResultadoN2 {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Hidden
    private Long id;

    /** Candidato evaluado. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidato_id", nullable = false)
    @Required
    @NoCreate @NoModify
    @DescriptionsList(descriptionProperties = "correo, nombres, apellidos")
    private Candidato candidato;

    /** Instancia del Test Numérico que se aplicó. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "test_numerico_id", nullable = false)
    @Required
    @NoCreate @NoModify
    @DescriptionsList(descriptionProperties = "nombre")
    private TestNumerico testNumerico;

    /** Puntuación Directa (P.D.): número total de aciertos. */
    @Column(nullable = false)
    @Required
    private Integer puntuacionDirecta;

    /** Percentil obtenido tras consultar el baremo nacional. */
    @Column
    private Integer percentil;

    /** Registro del baremo utilizado para la transformación P.D. → Percentil. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "baremo_id")
    @NoCreate @NoModify
    @DescriptionsList(descriptionProperties = "puntuacionDirectaMinima, puntuacionDirectaMaxima, percentil")
    private BaremoNacional baremoAplicado;

    /** Fecha y hora en que se completó la evaluación. */
    @Hidden
    @Column(nullable = false)
    private LocalDateTime fechaEvaluacion;

    // ──────────────────────────────────────────────
    //  Métodos de ciclo de vida JPA
    // ──────────────────────────────────────────────

    /**
     * Asigna automáticamente la fecha de evaluación antes de persistir.
     */
    @PrePersist
    public void antesDeGuardar() {
        if (fechaEvaluacion == null) {
            fechaEvaluacion = LocalDateTime.now();
        }
    }

    // ──────────────────────────────────────────────
    //  Métodos de consulta
    // ──────────────────────────────────────────────

    /**
     * Indica si el resultado ya tiene un percentil calculado.
     *
     * @return {@code true} si el percentil ha sido asignado
     */
    public boolean tienePercentil() {
        return percentil != null;
    }
}
