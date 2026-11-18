package com.saasfinanceiro.finexp.exceptions;

/** The AI provider is not configured or did not answer (HTTP 503). */
public class AiUnavailableException extends RuntimeException {
    public AiUnavailableException(String message) {
        super(message);
    }
}
