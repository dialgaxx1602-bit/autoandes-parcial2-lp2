package pe.edu.upeu.autoandes.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import pe.edu.upeu.autoandes.dto.request.LoginRequestDTO;
import pe.edu.upeu.autoandes.dto.response.LoginResponseDTO;
import pe.edu.upeu.autoandes.dto.response.UsuarioResponseDTO;
import pe.edu.upeu.autoandes.service.AuthService;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Autenticación", description = "Endpoints para login y obtención de datos del usuario autenticado")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    @Operation(summary = "Iniciar sesión y obtener token JWT")
    public ResponseEntity<LoginResponseDTO> login(@Valid @RequestBody LoginRequestDTO request) {
        LoginResponseDTO response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    @Operation(summary = "Obtener datos y permisos del usuario del token")
    public ResponseEntity<UsuarioResponseDTO> me(Authentication authentication) {
        String username = authentication.getName();
        UsuarioResponseDTO response = authService.obtenerUsuarioActual(username);
        return ResponseEntity.ok(response);
    }
}
