package com.saasfinanceiro.finexp.dto.wallet;

import jakarta.validation.constraints.NotNull;

import com.saasfinanceiro.finexp.model.enums.WalletRole;

public record UpdateMemberRoleRequest(
        @NotNull(message = "Role is required (EDITOR or VIEWER)") WalletRole role) {
}
