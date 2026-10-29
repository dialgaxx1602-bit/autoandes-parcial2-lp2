package pe.edu.upeu.autoandes.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VehiculoResponseDTO {
    private Long id;
    private String placa;
    private String marca;
    private String modelo;
    private Integer anio;
    private Long clienteId;
    private String clienteNombre;
}
