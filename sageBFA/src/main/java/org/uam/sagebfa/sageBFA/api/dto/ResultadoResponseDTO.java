package org.uam.sagebfa.sageBFA.api.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResultadoResponseDTO {
    private Long id;
    private String candidatoNombres;
    private String candidatoApellidos;
    private String candidatoCorreo;
    private Integer puntuacionDirecta;
    private Integer percentil;
    private String fechaEvaluacion;
    private String nombrePrueba;
}
