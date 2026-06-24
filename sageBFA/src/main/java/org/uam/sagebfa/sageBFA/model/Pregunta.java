package org.uam.sagebfa.sageBFA.model;

import java.util.*;

import javax.persistence.*;

import org.openxava.annotations.*;

import lombok.*;

/**
 * Entidad que modela una pregunta dentro de una prueba de aptitud.
 * <p>
 * Cada pregunta tiene un enunciado, un orden de presentación, una sección
 * dentro del Factor N2 y un conjunto de {@link OpcionRespuesta opciones}
 * (A, B, C, D). Pertenece a exactamente una {@link PruebaAptitud}.
 * </p>
 *
 * @author SageBFA Team
 */
@Entity
@Getter @Setter
@Tab(properties = "orden, seccion, enunciado")
@View(members = ""
    + "Pregunta {"
    + "  orden; seccion;"
    + "  enunciado"
    + "}"
    + "Opciones de Respuesta {"
    + "  opciones"
    + "}"
)
public class Pregunta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Hidden
    private Long id;

    /** Orden de aparición en la prueba (1, 2, 3...). */
    @Column(nullable = false)
    @Required
    private Integer orden;

    /** Sección del Factor N2 a la que pertenece esta pregunta. */
    @Column(nullable = false)
    @Required
    @Enumerated(EnumType.STRING)
    private SeccionN2 seccion;

    /** Texto del enunciado de la pregunta. */
    @Column(nullable = false, length = 1000)
    @Required
    @Stereotype("TEXT_AREA")
    private String enunciado;

    /** Prueba a la que pertenece esta pregunta (relación inversa). */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prueba_id", nullable = false)
    @Required
    @NoCreate @NoModify
    @DescriptionsList(descriptionProperties = "nombre")
    private PruebaAptitud prueba;

    /** Opciones de respuesta disponibles (A, B, C, D). */
    @OneToMany(mappedBy = "pregunta", cascade = CascadeType.ALL, orphanRemoval = true)
    @ListProperties("literal, textoOpcion, esCorrecta")
    @OrderBy("literal ASC")
    private List<OpcionRespuesta> opciones = new ArrayList<>();

    // ──────────────────────────────────────────────
    //  Métodos de conveniencia
    // ──────────────────────────────────────────────

    /**
     * Agrega una opción de respuesta asociándola bidireccional con esta pregunta.
     *
     * @param opcion la opción a agregar
     */
    public void agregarOpcion(OpcionRespuesta opcion) {
        opciones.add(opcion);
        opcion.setPregunta(this);
    }

    /**
     * Obtiene la opción correcta de esta pregunta.
     *
     * @return la opción marcada como correcta, o {@code null} si no se ha definido
     */
    public OpcionRespuesta obtenerOpcionCorrecta() {
        for (OpcionRespuesta opcion : opciones) {
            if (opcion.getEsCorrecta()) {
                return opcion;
            }
        }
        return null;
    }
}
