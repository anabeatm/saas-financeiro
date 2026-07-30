package com.saasfinanceiro.finexp.dto.auth;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(@NotBlank(message = "{user.email.notblank}") String email, @NotBlank(message = "{user.password.notblank}") String password) {
    
}
