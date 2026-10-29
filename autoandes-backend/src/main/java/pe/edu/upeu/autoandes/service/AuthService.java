package pe.edu.upeu.autoandes.service;

import pe.edu.upeu.autoandes.dto.request.LoginRequestDTO;
import pe.edu.upeu.autoandes.dto.response.LoginResponseDTO;
import pe.edu.upeu.autoandes.dto.response.UsuarioResponseDTO;

public interface AuthService {
    LoginResponseDTO login(LoginRequestDTO request);
    UsuarioResponseDTO obtenerUsuarioActual(String username);
}
