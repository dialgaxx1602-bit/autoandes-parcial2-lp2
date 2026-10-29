package pe.edu.upeu.autoandes.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ServicioResponseDTO {
    private Long id;
    private String codigo;
    private String nombre;
    private BigDecimal precio;
    private Integer duracionMin;
    private Integer activo;
}
