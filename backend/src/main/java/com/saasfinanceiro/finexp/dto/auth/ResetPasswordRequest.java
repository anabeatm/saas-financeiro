package com.saasfinanceiro.finexp.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ResetPasswordRequest(
    @NotBlank 
    String token,
            
    @NotBlank @Size(min = 6, message = "The password must be at least 6 characters long") 
    String newPassword
) {}
