package com.saasfinanceiro.finexp.exceptions;

/** The request is well-formed but cannot be honoured, e.g. an invalid or expired token (HTTP 400). */
public class BadRequestException extends RuntimeException {
    public BadRequestException(String message) {
        super(message);
    }
}
