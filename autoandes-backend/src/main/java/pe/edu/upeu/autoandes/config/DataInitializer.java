package pe.edu.upeu.autoandes.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.upeu.autoandes.entity.Usuario;
import pe.edu.upeu.autoandes.repository.UsuarioRepository;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        List<Usuario> usuarios = usuarioRepository.findAll();
        for (Usuario u : usuarios) {
            String pass = u.getPassword();
            if (pass != null && !pass.startsWith("$2a$") && !pass.startsWith("$2b$") && !pass.startsWith("$2y$")) {
                String hashed = passwordEncoder.encode(pass);
                u.setPassword(hashed);
                usuarioRepository.save(u);
                log.info("Contraseña cifrada con BCrypt para usuario: {}", u.getUsername());
            }
        }
    }
}
