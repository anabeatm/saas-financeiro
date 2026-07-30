package com.saasfinanceiro.finexp.dto.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChangePasswordRequest(
    @NotBlank(message = "The current password is required")
        String oldPassword,
                    
    @NotBlank(message = "{user.password.notblank}")
    @Size(min=8, message = "{user.password.size}")
        String newPassword
) {
    
}
