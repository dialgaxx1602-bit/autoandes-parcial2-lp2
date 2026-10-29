package pe.edu.upeu.autoandes.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrdenResponseDTO {
    private Long id;
    private String numero;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime fecha;

    private Long vehiculoId;
    private String vehiculoPlaca;
    private String clienteNombre;
    private Integer kilometraje;
    private String estado;
    private BigDecimal total;
    private String usuarioRegistro;
    private String motivoAnulacion;
    private List<DetalleOrdenResponseDTO> detalles;
}
