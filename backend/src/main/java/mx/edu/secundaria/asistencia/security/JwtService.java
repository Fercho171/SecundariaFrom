package mx.edu.secundaria.asistencia.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import mx.edu.secundaria.asistencia.config.JwtProperties;
import mx.edu.secundaria.asistencia.model.User;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;

@Service
public class JwtService {

    private final SecretKey key;
    private final long expirationMinutes;

    public JwtService(JwtProperties jwtProperties) {
        // La clave debe tener al menos 256 bits para HS256.
        this.key = Keys.hmacShaKeyFor(jwtProperties.secreto().getBytes(StandardCharsets.UTF_8));
        this.expirationMinutes = jwtProperties.expiracionMinutos();
    }

    public String generateToken(User user) {
        Instant now = Instant.now();
        return Jwts.builder()
            .subject(user.getUsername())
            .claim("userId", user.getId())
            .claim("email", user.getEmail())
            .claim("fullName", user.getFullName())
            .claim("role", user.getRole().name())
            .claim("teacherId", user.getTeacher() != null ? user.getTeacher().getId() : null)
            .issuedAt(Date.from(now))
            .expiration(Date.from(now.plus(expirationMinutes, ChronoUnit.MINUTES)))
            .signWith(key)
            .compact();
    }

    public Claims parseClaims(String token) {
        return Jwts.parser()
            .verifyWith(key)
            .build()
            .parseSignedClaims(token)
            .getPayload();
    }
}
