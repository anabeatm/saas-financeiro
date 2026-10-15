package com.saasfinanceiro.finexp.dto.auth;

import jakarta.validation.constraints.NotBlank;

public record VerifyAccountRequest(@NotBlank String token) {}
