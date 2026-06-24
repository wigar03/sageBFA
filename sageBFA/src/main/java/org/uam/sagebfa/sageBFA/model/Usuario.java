package org.uam.sagebfa.sageBFA.model;

import javax.persistence.*;

import org.openxava.annotations.*;

import lombok.*;

/**
 * Clase abstracta raíz de la jerarquía de usuarios del sistema BFA.
 * <p>
 * Define los atributos comunes de identidad (nombres, apellidos, correo)
 * que comparten tanto los usuarios administrativos como los candidatos.
 * Utiliza estrategia de herencia JOINED para mantener tablas separadas
 * y facilitar consultas polimórficas.
 * </p>
 *
 * @author SageBFA Team
 */
@Entity
@Inheritance(strategy = InheritanceType.JOINED)
@DiscriminatorColumn(name = "TIPO_USUARIO", discriminatorType = DiscriminatorType.STRING)
@Getter @Setter
@Tab(properties = "nombres, apellidos, correo")
public abstract class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Hidden
    private Long id;

    @Column(nullable = false, length = 100)
    @Required
    private String nombres;

    @Column(nullable = false, length = 100)
    @Required
    private String apellidos;

    @Column(nullable = false, unique = true, length = 150)
    @Required
    @Stereotype("EMAIL")
    private String correo;
}
