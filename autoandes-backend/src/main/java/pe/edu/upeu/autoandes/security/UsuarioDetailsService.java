package pe.edu.upeu.autoandes.security;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.upeu.autoandes.entity.Rol;
import pe.edu.upeu.autoandes.entity.Usuario;
import pe.edu.upeu.autoandes.repository.UsuarioRepository;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UsuarioDetailsService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + username));

        List<String> nombresRoles = usuario.getRoles().stream()
                .map(Rol::getNombre)
                .collect(Collectors.toList());

        
        Set<Permiso> permisos = PermisosPorRol.obtenerPermisosDeRoles(nombresRoles);

        
        List<GrantedAuthority> authorities = permisos.stream()
                .map(p -> new SimpleGrantedAuthority(p.name()))
                .collect(Collectors.toList());

        boolean activo = usuario.getActivo() != null && usuario.getActivo() == 1;

        return User.builder()
                .username(usuario.getUsername())
                .password(usuario.getPassword())
                .disabled(!activo)
                .authorities(authorities)
                .build();
    }
}
