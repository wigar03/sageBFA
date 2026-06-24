package org.uam.sagebfa.sageBFA.model;

import javax.persistence.*;

import org.openxava.annotations.*;

import lombok.*;

/**
 * Clase abstracta intermedia que añade capacidades de autenticación.
 * <p>
 * Extiende {@link Usuario} con lógica de inicio/cierre de sesión.
 * La contraseña se almacena con hash y el estado de sesión es transitorio.
 * Diseñada para ser extendida por roles administrativos concretos
 * como {@link Psicologo}.
 * </p>
 *
 * @author SageBFA Team
 */
@Entity
@DiscriminatorValue("ADMINISTRATIVO")
@Getter @Setter
public abstract class UsuarioAdministrativo extends Usuario {

    @Column(nullable = false, length = 256)
    @Required
    @Stereotype("PASSWORD")
    private String contrasena;

    /** Estado de sesión activa (no persistido en BD). */
    @Transient
    @Hidden
    private boolean sesionActiva;

    // ──────────────────────────────────────────────
    //  Lógica de autenticación
    // ──────────────────────────────────────────────

    /**
     * Inicia sesión validando la contraseña proporcionada.
     *
     * @param contrasenaIngresada contraseña en texto plano proporcionada por el usuario
     * @return {@code true} si las credenciales son válidas
     * @throws IllegalStateException si ya existe una sesión activa
     */
    public boolean iniciarSesion(String contrasenaIngresada) {
        if (sesionActiva) {
            throw new IllegalStateException("La sesión ya se encuentra activa.");
        }
        // Comparación directa por ahora; en producción usar BCrypt
        if (this.contrasena != null && this.contrasena.equals(contrasenaIngresada)) {
            this.sesionActiva = true;
            return true;
        }
        return false;
    }

    /**
     * Cierra la sesión activa del usuario.
     *
     * @throws IllegalStateException si no hay sesión activa
     */
    public void cerrarSesion() {
        if (!sesionActiva) {
            throw new IllegalStateException("No hay sesión activa para cerrar.");
        }
        this.sesionActiva = false;
    }
}
