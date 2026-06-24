package org.uam.sagebfa.sageBFA.model;

/**
 * Enumeración que representa el sexo biológico del candidato.
 * <p>
 * Se utiliza para la clasificación demográfica en la consulta de
 * baremos nacionales, donde las tablas de percentiles pueden variar
 * según el sexo.
 * </p>
 *
 * @author SageBFA Team
 */
public enum Sexo {

    MASCULINO("Masculino"),
    FEMENINO("Femenino");

    private final String etiqueta;

    Sexo(String etiqueta) {
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
