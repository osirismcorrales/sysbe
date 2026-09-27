package com.sbe.backend.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtils {

    private final SecretKey secretKey;
    private final long expirationMs;

    public JwtUtils(@Value("${jwt.secret}") String secret, @Value("${jwt.expiration-ms}") long expirationMs) {

        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));

        this.expirationMs = expirationMs;
    }

    public String generateToken(String dni, String rol) {

        Date ahora = new Date();
        Date expiracion = new Date(ahora.getTime() + expirationMs);

        return Jwts.builder()
                .subject(dni)
                .claim("role", rol)
                .issuedAt(ahora)
                .expiration(expiracion)
                .signWith(secretKey)
                .compact();
    }
}