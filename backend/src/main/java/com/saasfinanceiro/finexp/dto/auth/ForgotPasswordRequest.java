package com.saasfinanceiro.finexp.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

// NOTE: RECORD é um recurso que permite criar classes imutáveis focadas no armazenamento de dados
public record ForgotPasswordRequest(@NotBlank(message = "{user.email.notblank}") @Email String email){}
