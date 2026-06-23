package org.uam.sagebfa.sageBFA.model;

import java.util.*;

import javax.persistence.*;

import org.openxava.annotations.*;

import lombok.*;

/**
 * Clase abstracta raíz de la jerarquía de pruebas de aptitud BFA.
 * <p>
 * Modela los atributos comunes a cualquier factor de la batería (N2, V, R, etc.).
 * Cada prueba tiene un tiempo límite y está compuesta por un conjunto ordenado
 * de {@link Pregunta preguntas}. Las subclases concretas (como {@link TestNumerico})
 * implementan la lógica de calificación específica de cada factor.
 * </p>
 *
 * @author SageBFA Team
 */
@Entity
@Inheritance(strategy = InheritanceType.JOINED)
@DiscriminatorColumn(name = "TIPO_PRUEBA", discriminatorType = DiscriminatorType.STRING)
@Getter @Setter
@Tab(properties = "nombre, tiempoLimiteMinutos")
public abstract class PruebaAptitud {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Hidden
    private Long idPrueba;

    @Column(nullable = false, length = 120)
    @Required
    private String nombre;

    /** Tiempo límite en minutos para completar la prueba. */
    @Column(nullable = false)
    @Required
    private Integer tiempoLimiteMinutos;

    /** Colección ordenada de preguntas que componen esta prueba. */
    @OneToMany(mappedBy = "prueba", cascade = CascadeType.ALL, orphanRemoval = true)
    @ListProperties("orden, enunciado")
    @OrderBy("orden ASC")
    private List<Pregunta> preguntas = new ArrayList<>();

    // ──────────────────────────────────────────────
    //  Métodos abstractos (polimorfismo)
    // ──────────────────────────────────────────────

    /**
     * Calcula la Puntuación Directa (P.D.) para un conjunto de respuestas.
     * <p>
     * Cada subclase implementa la regla de calificación correspondiente
     * a su factor (ej.: solo aciertos para N2, con penalización para otros).
     * </p>
     *
     * @param respuestas lista de respuestas del candidato
     * @return puntuación directa calculada
     */
    public abstract int calcularPuntuacionDirecta(List<RespuestaCandidato> respuestas);

    // ──────────────────────────────────────────────
    //  Métodos de conveniencia
    // ──────────────────────────────────────────────

    /**
     * Agrega una pregunta asociándola bidireccional con esta prueba.
     *
     * @param pregunta la pregunta a agregar
     */
    public void agregarPregunta(Pregunta pregunta) {
        preguntas.add(pregunta);
        pregunta.setPrueba(this);
    }

    /**
     * @return cantidad total de preguntas en la prueba
     */
    public int getTotalPreguntas() {
        return preguntas.size();
    }
}
