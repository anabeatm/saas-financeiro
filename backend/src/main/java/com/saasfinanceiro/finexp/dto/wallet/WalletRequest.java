package com.saasfinanceiro.finexp.dto.wallet;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record WalletRequest(
    @NotBlank(message = "Wallet name is required")
    @Size(max = 50, message = "Name cannot exceed 50 characters")
    String name,
    
    @Size(max = 255, message = "Description cannot exceed 255 characters")
    String description
) {}
