package pe.edu.upeu.autoandes.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;
import pe.edu.upeu.autoandes.security.RestAccessDeniedHandler;
import pe.edu.upeu.autoandes.security.RestAuthenticationEntryPoint;

import static pe.edu.upeu.autoandes.security.Permiso.*;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private static final String[] RUTAS_PUBLICAS = {
            "/api/v1/auth/login",
            "/swagger-ui.html",
            "/swagger-ui/**",
            "/v3/api-docs/**",
            "/v3/api-docs.yaml",
            "/error"
    };

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            JwtAuthenticationFilter jwtFilter,
            CorsConfigurationSource corsConfigurationSource,
            RestAuthenticationEntryPoint authenticationEntryPoint,
            RestAccessDeniedHandler accessDeniedHandler) throws Exception {

        http
                .csrf(AbstractHttpConfigurer::disable)
                .logout(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint(authenticationEntryPoint)
                        .accessDeniedHandler(accessDeniedHandler)
                )
                .authorizeHttpRequests(auth -> auth
                        
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(RUTAS_PUBLICAS).permitAll()

                        
                        .requestMatchers(HttpMethod.GET, "/api/v1/clientes/**").hasAuthority(VEHICULO_LEER.name())

                        
                        .requestMatchers(HttpMethod.GET, "/api/v1/servicios/**").hasAuthority(SERVICIO_LEER.name())
                        .requestMatchers(HttpMethod.POST, "/api/v1/servicios").hasAuthority(SERVICIO_ESCRIBIR.name())
                        .requestMatchers(HttpMethod.PUT, "/api/v1/servicios/**").hasAuthority(SERVICIO_ESCRIBIR.name())
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/servicios/**").hasAuthority(SERVICIO_ESCRIBIR.name())
                        .requestMatchers(HttpMethod.PATCH, "/api/v1/servicios/*/estado").hasAuthority(SERVICIO_ESCRIBIR.name())

                        
                        .requestMatchers(HttpMethod.GET, "/api/v1/vehiculos/**").hasAuthority(VEHICULO_LEER.name())
                        .requestMatchers(HttpMethod.POST, "/api/v1/vehiculos").hasAuthority(VEHICULO_ESCRIBIR.name())
                        .requestMatchers(HttpMethod.PUT, "/api/v1/vehiculos/**").hasAuthority(VEHICULO_ESCRIBIR.name())
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/vehiculos/**").hasAuthority(VEHICULO_ESCRIBIR.name())

                        
                        .requestMatchers(HttpMethod.POST, "/api/v1/ordenes").hasAuthority(ORDEN_REGISTRAR.name())
                        .requestMatchers(HttpMethod.PATCH, "/api/v1/ordenes/*/anular").hasAuthority(ORDEN_ANULAR.name())
                        .requestMatchers(HttpMethod.GET, "/api/v1/ordenes/**").hasAuthority(ORDEN_LEER.name())

                        
                        .requestMatchers("/api/v1/reportes/**").hasAuthority(REPORTE_VER.name())

                        
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }
}
