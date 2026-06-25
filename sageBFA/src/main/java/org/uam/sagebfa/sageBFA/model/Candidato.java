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
@DiscriminatorValue("CANDIDATO")
@Getter @Setter
@Tab(properties = "nombreCompleto, cedula, edad, departamento, puntuacionFinal, percentil, diagnostico")
@View(members = ""
    + "Datos Personales {"
    + "  nombres; apellidos; correo; cedula; edad; telefono;"
    + "  fechaNacimiento; sexo; nivelEstudio; departamento; municipio; tipoColegio"
    + "}"
    + "Resultados de la Evaluación {"
    + "  puntuacionFinal; percentil; diagnostico"
    + "}"
    + "Consentimiento {"
    + "  aceptoConsentimientoInformado"
    + "}"
    + "Respuestas {"
    + "  respuestas"
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

    /** Colección de respuestas registradas durante la evaluación. */
    @OneToMany(mappedBy = "candidato", cascade = CascadeType.ALL, orphanRemoval = true)
    @ListProperties("pregunta.enunciado, opcionElegida.literal, tiempoSegundos")
    @OrderBy("id ASC")
    private List<RespuestaCandidato> respuestas = new ArrayList<>();

    // ──────────────────────────────────────────────
    //  Propiedades calculadas no persistidas
    // ──────────────────────────────────────────────

    @Transient
    public String getNombreCompleto() {
        return getNombres() + " " + getApellidos();
    }

    @Transient
    public Integer getPuntuacionFinal() {
        if (respuestas == null || respuestas.isEmpty()) return 0;
        int aciertos = 0;
        for (RespuestaCandidato r : respuestas) {
            if (r.getOpcionElegida() != null && Boolean.TRUE.equals(r.getOpcionElegida().getEsCorrecta())) {
                aciertos++;
            }
        }
        return aciertos;
    }

    @Transient
    public int getPercentil() {
        int score = getPuntuacionFinal();
        switch (score) {
            case 0: return 5;
            case 1: return 10;
            case 2: return 20;
            case 3: return 35;
            case 4: return 45;
            case 5: return 60;
            case 6: return 75;
            case 7: return 85;
            case 8: return 90;
            case 9:
            case 10: return 95;
            case 11:
            case 12: return 97;
            default: return 99;
        }
    }

    @Transient
    public String getDiagnostico() {
        int score = getPuntuacionFinal();
        switch (score) {
            case 0: return "Deficiente";
            case 1:
            case 2: return "Inferior";
            case 3: return "Medio Bajo";
            case 4: return "Medio";
            case 5: return "Medio Alto";
            case 6:
            case 7: return "Superior";
            case 8:
            case 9:
            case 10: return "Muy Superior";
            default: return "Excelente";
        }
    }

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
