package com.saasfinanceiro.finexp.dto.auth;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * debugToken is only populated when app.debug-reset-token=true (course/testing
 * environments without real e-mail delivery). It is omitted from the JSON otherwise.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ForgotPasswordResponse(String message, String debugToken) {}
