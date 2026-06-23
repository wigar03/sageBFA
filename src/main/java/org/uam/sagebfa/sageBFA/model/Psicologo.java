package org.uam.sagebfa.sageBFA.model;

import javax.persistence.*;

import org.openxava.annotations.*;

import lombok.*;

/**
 * Entidad concreta que representa a un Psicólogo del sistema BFA.
 * <p>
 * Hereda la autenticación de {@link UsuarioAdministrativo} y añade
 * el número de colegiado que identifica al profesional. Los psicólogos
 * acceden al back-office de OpenXava para gestionar preguntas, baremos
 * y resultados de candidatos.
 * </p>
 *
 * @author SageBFA Team
 */
@Entity
@DiscriminatorValue("PSICOLOGO")
@Getter @Setter
@Tab(properties = "nombres, apellidos, correo, numeroColegiado")
public class Psicologo extends UsuarioAdministrativo {

    @Column(nullable = false, unique = true, length = 20)
    @Required
    private String numeroColegiado;
}
