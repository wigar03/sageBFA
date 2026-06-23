package org.uam.sagebfa.sageBFA.model;

/**
 * Enumeración que representa el nivel de estudios del candidato.
 * <p>
 * Se utiliza como dato demográfico en la evaluación BFA. Las tablas
 * de baremos nacionales pueden segmentarse por nivel educativo.
 * </p>
 *
 * @author SageBFA Team
 */
public enum NivelEstudio {

    PRIMARIA("Primaria"),
    SECUNDARIA("Secundaria"),
    BACHILLERATO("Bachillerato"),
    TECNICO("Técnico"),
    LICENCIATURA("Licenciatura"),
    POSGRADO("Posgrado");

    private final String etiqueta;

    NivelEstudio(String etiqueta) {
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
