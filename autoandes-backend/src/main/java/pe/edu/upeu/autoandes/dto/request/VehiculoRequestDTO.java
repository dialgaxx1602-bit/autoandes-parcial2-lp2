package pe.edu.upeu.autoandes.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VehiculoRequestDTO {

    @NotBlank(message = "La placa es obligatoria")
    @Pattern(regexp = "^[A-Z]{3}-\\d{3}$", message = "La placa debe tener el formato ABC-123")
    private String placa;

    @NotBlank(message = "La marca es obligatoria")
    private String marca;

    @NotBlank(message = "El modelo es obligatorio")
    private String modelo;

    @NotNull(message = "El año es obligatorio")
    @Min(value = 1990, message = "El año mínimo permitido es 1990")
    @Max(value = 2027, message = "El año máximo permitido es 2027")
    private Integer anio;

    @NotNull(message = "El clienteId es obligatorio")
    private Long clienteId;
}
