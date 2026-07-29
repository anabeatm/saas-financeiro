package com.saasfinanceiro.finexp.dto.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChangePasswordRequest(
    @NotBlank(message = "The current password is required")
        String oldPassword,
                    
    @NotBlank(message = "The new password is required")
    @Size(min=6, message="The new password must be at least 6 characters long")
        String newPassword
) {
    
}
