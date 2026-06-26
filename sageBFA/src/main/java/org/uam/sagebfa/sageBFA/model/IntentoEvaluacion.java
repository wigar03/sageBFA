package org.uam.sagebfa.sageBFA.model;

import java.time.*;
import java.util.*;
import javax.persistence.*;
import org.openxava.annotations.*;
import lombok.*;

/**
 * Entidad genérica que representa un intento de evaluación completado por un candidato
 * para un módulo de prueba específico.
 * <p>
 * Reemplaza los resultados hardcodeados y almacena la puntuación directa, percentil,
 * diagnóstico, baremo nacional aplicado, y la fecha/hora del intento.
 * </p>
 */
@Entity
@Getter @Setter
@Tab(properties = "candidato.correo, moduloPrueba.codigoModulo, puntuacionDirecta, percentil, fechaHora")
@View(members = ""
    + "Evaluación {"
    + "  candidato; moduloPrueba; fechaHora"
    + "}"
    + "Resultados {"
    + "  puntuacionDirecta; percentil; diagnostico;"
    + "  baremoAplicado"
    + "}"
    + "Respuestas Elegidas {"
    + "  respuestas"
    + "}"
)
public class IntentoEvaluacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Hidden
    private Long id;

    /** Candidato que realizó la prueba en este intento. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidato_id", nullable = false)
    @Required
    @NoCreate @NoModify
    @DescriptionsList(descriptionProperties = "correo, nombres, apellidos")
    private Candidato candidato;

    /** Módulo evaluado. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "modulo_prueba_id", nullable = false)
    @Required
    @NoCreate @NoModify
    @DescriptionsList(descriptionProperties = "codigoModulo, nombre")
    private ModuloPrueba moduloPrueba;

    /** Fecha y hora de finalización del intento. */
    @Column(nullable = false)
    @Required
    private java.util.Date fechaHora;

    /** Puntuación directa (PD): aciertos totales (o penalizados, según regla). */
    @Column(nullable = false)
    @Required
    private Integer puntuacionDirecta;

    /** Percentil calculado para este intento a partir del baremo nacional. */
    @Column
    private Integer percentil;

    /** Diagnóstico cualitativo obtenido. */
    @Column(length = 50)
    private String diagnostico;

    /** Baremo nacional que se utilizó para mapear PD -> Percentil. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "baremo_id")
    @NoCreate @NoModify
    @DescriptionsList(descriptionProperties = "puntuacionDirectaMinima, puntuacionDirectaMaxima, percentil")
    private BaremoNacional baremoAplicado;

    /** Respuestas dadas por el candidato a las preguntas en este intento. */
    @OneToMany(mappedBy = "intento", cascade = CascadeType.ALL, orphanRemoval = true)
    @ListProperties("pregunta.orden, pregunta.seccion, pregunta.enunciado, opcionElegida.literal, tiempoSegundos")
    @OrderBy("id ASC")
    private List<RespuestaCandidato> respuestas = new ArrayList<>();

    @PrePersist
    public void antesDeGuardar() {
        if (fechaHora == null) {
            fechaHora = new java.util.Date();
        }
    }

    /**
     * Agrega una respuesta asociándola bidireccionalmente con este intento.
     *
     * @param respuesta la respuesta individual a agregar
     */
    public void agregarRespuesta(RespuestaCandidato respuesta) {
        respuestas.add(respuesta);
        respuesta.setIntento(this);
    }
}
