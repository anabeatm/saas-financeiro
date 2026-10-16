package com.saasfinanceiro.finexp.dto.auth;

public record LoginResponse(String accessToken, String tokenType, long expiresIn) {}
