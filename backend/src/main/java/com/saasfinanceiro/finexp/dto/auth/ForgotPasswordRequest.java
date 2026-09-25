package com.saasfinanceiro.finexp.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

// NOTE: Records are immutable data carriers.
public record ForgotPasswordRequest(@NotBlank(message = "{user.email.notblank}") @Email String email){}
