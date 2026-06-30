package com.saasfinanceiro.finexp.exceptions;

import java.time.LocalDateTime;

public record ErrorResponse(
    int status,
    String message,
    LocalDateTime dateTime) {
}
