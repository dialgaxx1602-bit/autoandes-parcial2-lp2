package pe.edu.upeu.autoandes.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.upeu.autoandes.config.JwtService;
import pe.edu.upeu.autoandes.dto.request.LoginRequestDTO;
import pe.edu.upeu.autoandes.dto.response.LoginResponseDTO;
import pe.edu.upeu.autoandes.dto.response.UsuarioResponseDTO;
import pe.edu.upeu.autoandes.entity.Rol;
import pe.edu.upeu.autoandes.entity.Usuario;
import pe.edu.upeu.autoandes.exception.ResourceNotFoundException;
import pe.edu.upeu.autoandes.repository.UsuarioRepository;
import pe.edu.upeu.autoandes.security.Permiso;
import pe.edu.upeu.autoandes.security.PermisosPorRol;
import pe.edu.upeu.autoandes.service.AuthService;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Override
    @Transactional(readOnly = true)
    public LoginResponseDTO login(LoginRequestDTO request) {
        final String mensajeErrorUniforme = "Credenciales incorrectas o cuenta inactiva";

        Optional<Usuario> usuarioOpt = usuarioRepository.findByUsername(request.getUsername());

        
        if (usuarioOpt.isEmpty()) {
            log.warn("Intento de login fallido: usuario no existe ({})", request.getUsername());
            throw new BadCredentialsException(mensajeErrorUniforme);
        }

        Usuario usuario = usuarioOpt.get();

        
        if (usuario.getActivo() == null || usuario.getActivo() != 1) {
            log.warn("Intento de login fallido: cuenta inactiva ({})", request.getUsername());
            throw new BadCredentialsException(mensajeErrorUniforme);
        }

        
        if (!passwordEncoder.matches(request.getPassword(), usuario.getPassword())) {
            log.warn("Intento de login fallido: contraseña incorrecta ({})", request.getUsername());
            throw new BadCredentialsException(mensajeErrorUniforme);
        }

        List<String> roles = usuario.getRoles().stream()
                .map(Rol::getNombre)
                .collect(Collectors.toList());

        Set<Permiso> permisosSet = PermisosPorRol.obtenerPermisosDeRoles(roles);
        List<String> permisos = permisosSet.stream()
                .map(Enum::name)
                .collect(Collectors.toList());

        String token = jwtService.generarToken(usuario.getUsername(), roles, permisos);

        log.info("Usuario autenticado exitosamente: {} con roles {}", usuario.getUsername(), roles);

        return LoginResponseDTO.builder()
                .token(token)
                .tipo("Bearer")
                .expiraEnSegundos(3600L)
                .nombreCompleto(usuario.getNombreCompleto())
                .roles(roles)
                .permisos(permisos)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public UsuarioResponseDTO obtenerUsuarioActual(String username) {
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado: " + username));

        List<String> roles = usuario.getRoles().stream()
                .map(Rol::getNombre)
                .collect(Collectors.toList());

        Set<Permiso> permisosSet = PermisosPorRol.obtenerPermisosDeRoles(roles);
        List<String> permisos = permisosSet.stream()
                .map(Enum::name)
                .collect(Collectors.toList());

        return UsuarioResponseDTO.builder()
                .id(usuario.getId())
                .username(usuario.getUsername())
                .nombreCompleto(usuario.getNombreCompleto())
                .roles(roles)
                .permisos(permisos)
                .build();
    }
}
