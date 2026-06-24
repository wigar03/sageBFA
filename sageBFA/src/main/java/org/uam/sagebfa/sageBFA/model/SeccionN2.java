package org.uam.sagebfa.sageBFA.model;

/**
 * Enumeración que identifica la sección dentro del Test Numérico (Factor N2).
 * <p>
 * Cada pregunta pertenece a una de las dos secciones cronometradas
 * independientemente en el frontend:
 * <ul>
 *   <li>{@link #OPERACIONES} — Ejercicios de cálculo aritmético (6 min).</li>
 *   <li>{@link #PROBLEMAS} — Problemas numéricos aplicados (6 min).</li>
 * </ul>
 * </p>
 *
 * @author SageBFA Team
 */
public enum SeccionN2 {

    OPERACIONES("Operaciones"),
    PROBLEMAS("Problemas");

    private final String etiqueta;

    SeccionN2(String etiqueta) {
        this.etiqueta = etiqueta;
    }

    public String getEtiqueta() {
        return etiqueta;
    }

    @Override
    public String toString() {
        return etiqueta;
    }
}
