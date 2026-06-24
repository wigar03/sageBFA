package org.uam.sagebfa.sageBFA.api.dto;

import java.util.List;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PreguntaDTO {
    private Long id;
    private Integer orden;
    private String seccion;
    private String enunciado;
    private List<OpcionRespuestaDTO> opciones;
}
