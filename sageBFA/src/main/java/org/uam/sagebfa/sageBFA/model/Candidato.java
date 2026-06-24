package org.uam.sagebfa.sageBFA.model;

import java.time.LocalDate;
import java.util.*;

import javax.persistence.*;

import org.openxava.annotations.*;

import lombok.*;

/**
 * Entidad concreta que representa a un Candidato que realiza la prueba BFA.
 * <p>
 * A diferencia de los usuarios administrativos, el candidato <strong>no</strong>
 * posee credenciales de inicio de sesión. Su identificación principal es el
 * correo electrónico (persistencia transitoria: solo se almacena durante la
 * sesión de evaluación). Se registran sus datos demográficos para la
 * consulta posterior del baremo nacional.
 * </p>
 * <p>
 * Relación: Un candidato puede tener múltiples {@link RespuestaCandidato}
 * (una por cada pregunta contestada durante la prueba).
 * </p>
 *
 * @author SageBFA Team
 */
@Entity
@DiscriminatorValue("CANDIDATO")
@Getter @Setter
@Tab(properties = "correo, nombres, apellidos, fechaNacimiento, sexo, nivelEstudio, aceptoConsentimientoInformado")
@View(members = ""
    + "Datos Personales {"
    + "  nombres; apellidos; correo;"
    + "  fechaNacimiento; sexo; nivelEstudio"
    + "}"
    + "Consentimiento {"
    + "  aceptoConsentimientoInformado"
    + "}"
    + "Respuestas {"
    + "  respuestas"
    + "}"
)
public class Candidato extends Usuario {

    @Column(nullable = false)
    @Required
    private LocalDate fechaNacimiento;

    @Column(nullable = false)
    @Required
    @Enumerated(EnumType.STRING)
    private Sexo sexo;

    @Column(nullable = false)
    @Required
    @Enumerated(EnumType.STRING)
    private NivelEstudio nivelEstudio;

    /**
     * Indica si el candidato aceptó el consentimiento informado.
     * <p>
     * Este campo se marca como {@code true} desde el frontend (SPA) cuando
     * el candidato firma la ficha de consentimiento antes de iniciar la prueba.
     * Es obligatorio: no se puede iniciar la evaluación sin aceptarlo.
     * </p>
     */
    @Column(nullable = false)
    @Required
    private Boolean aceptoConsentimientoInformado = false;

    /** Colección de respuestas registradas durante la evaluación. */
    @OneToMany(mappedBy = "candidato", cascade = CascadeType.ALL, orphanRemoval = true)
    @ListProperties("pregunta.enunciado, opcionElegida.literal, tiempoSegundos")
    @OrderBy("id ASC")
    private List<RespuestaCandidato> respuestas = new ArrayList<>();

    // ──────────────────────────────────────────────
    //  Métodos de conveniencia
    // ──────────────────────────────────────────────

    /**
     * Agrega una respuesta asociándola bidireccional con este candidato.
     *
     * @param respuesta la respuesta a agregar
     */
    public void agregarRespuesta(RespuestaCandidato respuesta) {
        respuestas.add(respuesta);
        respuesta.setCandidato(this);
    }

    /**
     * Calcula la edad del candidato en años a partir de su fecha de nacimiento.
     *
     * @return edad en años
     */
    public int calcularEdad() {
        return java.time.Period.between(fechaNacimiento, LocalDate.now()).getYears();
    }
}
