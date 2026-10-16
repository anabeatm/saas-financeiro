package com.saasfinanceiro.finexp.service;

import java.time.Duration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

import jakarta.annotation.PostConstruct;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTCreationException;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.saasfinanceiro.finexp.model.User;

@Service
public class TokenService {
    private static final int MIN_SECRET_LENGTH = 32;
    private static final long EXPIRATION_HOURS = 24;

    @Value("${jwt.secret}")
    private String secret;

    @PostConstruct
    void validateSecret() {
        if (secret == null || secret.length() < MIN_SECRET_LENGTH) {
            throw new IllegalStateException(
                    "jwt.secret must be configured with at least " + MIN_SECRET_LENGTH + " characters");
        }
    }

    public String generateToken(User user) {
        try {
            Algorithm algorithm = Algorithm.HMAC256(secret);
            return JWT.create()
                    .withIssuer("finEXP")
                    .withSubject(String.valueOf(user.getId()))
                    .withClaim("email", user.getEmail())
                    .withIssuedAt(Instant.now())
                    .withExpiresAt(genExpirationDate())
                    .sign(algorithm);
        } catch (JWTCreationException exception) {
            throw new RuntimeException("Error generating JWT token", exception);
        }
    }

    /** Returns the user id stored in the token's subject, or an empty string if the token is invalid. */
    public String validateToken(String token) {
        try{
            Algorithm algorithm = Algorithm.HMAC256(secret);
            return JWT.require(algorithm).withIssuer("finEXP").build().verify(token).getSubject();
        } catch(JWTVerificationException exception) {
            return "";
        }
    }
    
    public long getExpiresInSeconds() {
        return Duration.ofHours(EXPIRATION_HOURS).toSeconds();
    }

    private Instant genExpirationDate() {
        return Instant.now().plus(EXPIRATION_HOURS, ChronoUnit.HOURS);
    }
    
}
