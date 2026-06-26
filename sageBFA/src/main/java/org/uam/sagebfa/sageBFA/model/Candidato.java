package org.uam.sagebfa.sageBFA.model;

import java.time.LocalDate;
import java.util.*;

import javax.persistence.*;
import javax.persistence.Transient;

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
@Getter @Setter
@Tab(properties = "nombres, apellidos, correo, cedula, edad, departamento")
@View(members = ""
    + "Datos Personales {"
    + "  nombres; apellidos; correo; cedula; edad; telefono;"
    + "  fechaNacimiento; sexo; nivelEstudio; departamento; municipio; tipoColegio"
    + "}"
    + "Consentimiento {"
    + "  aceptoConsentimientoInformado"
    + "}"
    + "Historial de Evaluaciones {"
    + "  intentos"
    + "}"
)
public class Candidato extends Usuario {

    @Column(nullable = false, length = 16)
    @Required
    private String cedula;

    @Column(nullable = false)
    @Required
    private int edad;

    @Column(nullable = false, length = 20)
    @Required
    private String telefono;

    @Column(nullable = false, length = 100)
    @Required
    private String departamento;

    @Column(nullable = false, length = 100)
    @Required
    private String municipio;

    @Column(nullable = false, length = 20)
    @Required
    private String tipoColegio;

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

    /** Historial de intentos de evaluación del candidato. */
    @OneToMany(mappedBy = "candidato", cascade = CascadeType.ALL, orphanRemoval = true)
    @ListProperties("moduloPrueba.codigoModulo, moduloPrueba.nombre, puntuacionDirecta, percentil, diagnostico, fechaHora")
    @OrderBy("fechaHora DESC")
    private List<IntentoEvaluacion> intentos = new ArrayList<>();

    // ──────────────────────────────────────────────
    //  Propiedades calculadas no persistidas
    // ──────────────────────────────────────────────

    @Transient
    public String getNombreCompleto() {
        return getNombres() + " " + getApellidos();
    }

    // ──────────────────────────────────────────────
    //  Métodos de conveniencia
    // ──────────────────────────────────────────────

    /**
     * Calcula la edad del candidato en años a partir de su fecha de nacimiento.
     *
     * @return edad en años
     */
    public int calcularEdad() {
        return java.time.Period.between(fechaNacimiento, LocalDate.now()).getYears();
    }
}
