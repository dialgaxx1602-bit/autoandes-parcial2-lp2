package pe.edu.upeu.autoandes.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrdenRequestDTO {

    @NotNull(message = "El vehiculoId es obligatorio")
    private Long vehiculoId;

    @NotNull(message = "El kilometraje es obligatorio")
    @Min(value = 1, message = "El kilometraje debe ser mayor a 0")
    private Integer kilometraje;

    @NotEmpty(message = "La orden debe tener al menos un detalle")
    @Size(min = 1, max = 10, message = "Una orden debe tener entre 1 y 10 detalles")
    @Valid
    private List<DetalleOrdenRequestDTO> detalles;
}
