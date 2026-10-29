package pe.edu.upeu.autoandes.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponseDTO {
    private String token;

    @Builder.Default
    private String tipo = "Bearer";

    @Builder.Default
    private Long expiraEnSegundos = 3600L;

    private String nombreCompleto;
    private List<String> roles;
    private List<String> permisos;
}
