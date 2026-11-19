package com.saasfinanceiro.finexp.exceptions;

/** ia indisponível (503) */
public class AiUnavailableException extends RuntimeException {
    public AiUnavailableException(String message) {
        super(message);
    }
}
