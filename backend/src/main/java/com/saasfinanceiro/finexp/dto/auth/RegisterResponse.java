package com.saasfinanceiro.finexp.dto.auth;

import java.time.LocalDateTime;

import com.saasfinanceiro.finexp.model.User;

public record RegisterResponse(Long id, String name, String email, LocalDateTime createdAt) {
    public RegisterResponse(User user) {
        this(user.getId(), user.getName(), user.getEmail(), user.getCreatedAt());
    }
}
