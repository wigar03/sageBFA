package org.uam.sagebfa.sageBFA.api.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OpcionRespuestaDTO {
    private Long id;
    private String literal;
    private String textoOpcion;
}
