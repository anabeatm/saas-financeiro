package com.saasfinanceiro.finexp.dto.auth;

import com.fasterxml.jackson.annotation.JsonInclude;

/** debugToken só volta com app.debug-reset-token=true (pra testes) */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ForgotPasswordResponse(String message, String debugToken) {}
