package com.saasfinanceiro.finexp.exceptions;

import java.time.LocalDateTime;

public record ErrorResponse(
    LocalDateTime timestamp,
    Integer status,
    String error,
    String message
) {}