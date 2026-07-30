package com.saasfinanceiro.finexp.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ResetPasswordRequest(
    @NotBlank 
    String token,
            
    @NotBlank(message = "{user.password.notblank}") @Size(min = 8, message = "{user.password.size}") 
    String newPassword
) {}
