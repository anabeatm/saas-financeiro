package com.saasfinanceiro.finexp.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ResetPasswordRequest(
    @NotBlank 
    String token,
            
    @NotBlank @Size(min = 8, message = "The password must be at least 8 characters long") 
    String newPassword
) {}
