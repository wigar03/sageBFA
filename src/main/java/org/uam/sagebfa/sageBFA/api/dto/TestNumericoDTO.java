package org.uam.sagebfa.sageBFA.api.dto;

import java.util.List;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TestNumericoDTO {
    private Long idPrueba;
    private String nombre;
    private Integer tiempoLimiteMinutos;
    private Integer tiempoOperacionesMin;
    private Integer tiempoProblemasMin;
    private List<PreguntaDTO> operaciones;
    private List<PreguntaDTO> problemas;
}
