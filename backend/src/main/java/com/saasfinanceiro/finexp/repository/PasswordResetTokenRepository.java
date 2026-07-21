package com.saasfinanceiro.finexp.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.saasfinanceiro.finexp.model.PasswordResetToken;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    Optional<PasswordResetToken> findByToken(String token);
}
