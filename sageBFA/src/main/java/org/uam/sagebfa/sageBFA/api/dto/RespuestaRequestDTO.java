package org.uam.sagebfa.sageBFA.api.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RespuestaRequestDTO {
    private Long preguntaId;
    private Long opcionElegidaId; // Puede ser null si no contestó
    private Integer tiempoSegundos;
}
