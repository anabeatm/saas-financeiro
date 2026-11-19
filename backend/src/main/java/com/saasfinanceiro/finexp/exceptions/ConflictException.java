package com.saasfinanceiro.finexp.exceptions;

/** conflito com o estado atual (409) */
public class ConflictException extends RuntimeException {
    public ConflictException(String message) {
        super(message);
    }
}
