package com.saasfinanceiro.finexp.dto.wallet;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import com.saasfinanceiro.finexp.model.enums.WalletRole;

public record AddMemberRequest(
    @NotBlank(message = "Email is required") 
    @Email(message = "Invalid email format") 
    String email,
    
    @NotNull(message = "Role is required (EDITOR or VIEWER)") 
    WalletRole role
) {}