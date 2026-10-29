package pe.edu.upeu.autoandes.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {

    @Value("${app.jwt.secret}")
    private String secretKey;

    @Value("${app.jwt.expiration-seconds:3600}")
    private long jwtExpirationSeconds;

    public String generarToken(String username, List<String> roles, List<String> permisos) {
        Map<String, Object> extraClaims = Map.of(
                "roles", roles,
                "permisos", permisos
        );
        return Jwts.builder()
                .claims(extraClaims)
                .subject(username)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + (jwtExpirationSeconds * 1000)))
                .signWith(getSignInKey())
                .compact();
    }

    public String extraerUsername(String token) {
        return extraerClaim(token, Claims::getSubject);
    }

    @SuppressWarnings("unchecked")
    public List<String> extraerPermisos(String token) {
        Claims claims = extraerTodosLosClaims(token);
        return claims.get("permisos", List.class);
    }

    @SuppressWarnings("unchecked")
    public List<String> extraerRoles(String token) {
        Claims claims = extraerTodosLosClaims(token);
        return claims.get("roles", List.class);
    }

    public <T> T extraerClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extraerTodosLosClaims(token);
        return claimsResolver.apply(claims);
    }

    public boolean esTokenValido(String token, String username) {
        final String tokenUsername = extraerUsername(token);
        return (tokenUsername.equals(username)) && !esTokenExpirado(token);
    }

    public boolean esTokenExpirado(String token) {
        return extraerExpiracion(token).before(new Date());
    }

    private Date extraerExpiracion(String token) {
        return extraerClaim(token, Claims::getExpiration);
    }

    private Claims extraerTodosLosClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSignInKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private SecretKey getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
