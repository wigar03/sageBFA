package org.uam.sagebfa.sageBFA.model;

import java.util.*;
import javax.persistence.*;
import org.openxava.annotations.*;
import lombok.*;

/**
 * Entidad genérica que representa cualquier módulo de prueba en el sistema SAGE-BFA (ej. N1, N2, CV, VOC1).
 * <p>
 * Permite configurar el código, nombre, tiempo límite e instrucciones en formato HTML
 * directamente desde la base de datos y la interfaz administrativa.
 * </p>
 */
@Entity
@Getter @Setter
@Tab(properties = "codigoModulo, nombre, tiempoLimiteMinutos")
@View(members = ""
    + "Módulo {"
    + "  codigoModulo; nombre; tiempoLimiteMinutos"
    + "}"
    + "Instrucciones {"
    + "  instrucciones"
    + "}"
    + "Preguntas {"
    + "  preguntas"
    + "}"
)
public class ModuloPrueba {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Hidden
    private Long id;

    @Column(nullable = false, unique = true, length = 10)
    @Required
    private String codigoModulo;

    @Column(nullable = false, length = 150)
    @Required
    private String nombre;

    @Column(nullable = false)
    @Required
    private Integer tiempoLimiteMinutos;

    @Column(columnDefinition = "TEXT")
    @Stereotype("HTML_TEXT")
    private String instrucciones;

    /** Colección ordenada de preguntas asociadas a este módulo. */
    @OneToMany(mappedBy = "moduloPrueba", cascade = CascadeType.ALL, orphanRemoval = true)
    @ListProperties("orden, seccion, enunciado")
    @OrderBy("orden ASC")
    private List<Pregunta> preguntas = new ArrayList<>();

    /** Colección de baremos nacionales definidos para transformar puntuaciones directas a percentiles. */
    @OneToMany(mappedBy = "moduloPrueba", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<BaremoNacional> baremos = new ArrayList<>();

    // ──────────────────────────────────────────────
    //  Métodos de conveniencia
    // ──────────────────────────────────────────────

    /**
     * Asocia una pregunta bidireccionalmente a este módulo.
     *
     * @param pregunta la pregunta a añadir
     */
    public void agregarPregunta(Pregunta pregunta) {
        preguntas.add(pregunta);
        pregunta.setModuloPrueba(this);
    }
}
