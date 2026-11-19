package com.saasfinanceiro.finexp.exceptions;

/** request inválido, tipo token expirado (400) */
public class BadRequestException extends RuntimeException {
    public BadRequestException(String message) {
        super(message);
    }
}
