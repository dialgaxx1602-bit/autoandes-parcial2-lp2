package pe.edu.upeu.autoandes.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnularOrdenRequestDTO {

    @NotBlank(message = "El motivo de anulación es obligatorio")
    @Size(min = 10, max = 200, message = "El motivo debe tener entre 10 y 200 caracteres")
    private String motivo;
}
