package org.uam.sagebfa.sageBFA.model;

import javax.persistence.*;

import org.openxava.annotations.*;

import lombok.*;

/**
 * Entidad que almacena las tablas del Baremo Nacional para el Factor N2.
 * <p>
 * Cada registro mapea un rango de Puntuación Directa (P.D.) a un Percentil,
 * opcionalmente segmentado por nivel de estudios. Los psicólogos alimentan
 * esta tabla desde el back-office de OpenXava.
 * </p>
 * <p>
 * Ejemplo: P.D. mínima = 15, P.D. máxima = 18 → Percentil = 60
 * </p>
 *
 * @author SageBFA Team
 */
@Entity
@Getter @Setter
@Tab(properties = "nivelEstudio, puntuacionDirectaMinima, puntuacionDirectaMaxima, percentil")
@View(members = ""
    + "Rango de Puntuación {"
    + "  puntuacionDirectaMinima; puntuacionDirectaMaxima"
    + "}"
    + "Resultado {"
    + "  percentil; nivelEstudio"
    + "}"
)
public class BaremoNacional {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Hidden
    private Long id;

    /** Valor mínimo de P.D. incluido en este rango (inclusive). */
    @Column(nullable = false)
    @Required
    private Integer puntuacionDirectaMinima;

    /** Valor máximo de P.D. incluido en este rango (inclusive). */
    @Column(nullable = false)
    @Required
    private Integer puntuacionDirectaMaxima;

    /** Percentil correspondiente a este rango de P.D. (0–99). */
    @Column(nullable = false)
    @Required
    private Integer percentil;

    /**
     * Nivel de estudios al que aplica este baremo.
     * <p>
     * Si es {@code null}, el baremo es universal (aplica a todos los niveles).
     * </p>
     */
    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private NivelEstudio nivelEstudio;

    // ──────────────────────────────────────────────
    //  Métodos de consulta
    // ──────────────────────────────────────────────

    /**
     * Verifica si una Puntuación Directa dada cae dentro de este rango.
     *
     * @param puntuacionDirecta la P.D. a verificar
     * @return {@code true} si la P.D. está dentro del rango [min, max]
     */
    public boolean contienePuntuacion(int puntuacionDirecta) {
        return puntuacionDirecta >= puntuacionDirectaMinima
                && puntuacionDirecta <= puntuacionDirectaMaxima;
    }
}
