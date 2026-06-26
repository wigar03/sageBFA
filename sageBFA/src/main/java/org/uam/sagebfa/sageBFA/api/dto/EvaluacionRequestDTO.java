package org.uam.sagebfa.sageBFA.api.dto;

import java.util.List;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EvaluacionRequestDTO {
    // Datos del Candidato
    private String correo;
    private String nombres;
    private String apellidos;
    private String fechaNacimiento; // Recibido en formato YYYY-MM-DD
    private String sexo;            // MASCULINO o FEMENINO
    private String nivelEstudio;    // PRIMARIA, SECUNDARIA, etc.
    private Boolean aceptoConsentimientoInformado;

    // Nuevos campos demográficos
    private String cedula;
    private int edad;
    private String telefono;
    private String departamento;
    private String municipio;
    private String tipoColegio;

    // Código del módulo a evaluar (ej. N2, CV, N1)
    private String codigoModulo;

    // Listado de Respuestas
    private List<RespuestaRequestDTO> respuestas;
}
