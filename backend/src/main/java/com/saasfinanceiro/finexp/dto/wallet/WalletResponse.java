package com.saasfinanceiro.finexp.dto.wallet;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.saasfinanceiro.finexp.model.Wallet;
import com.saasfinanceiro.finexp.model.enums.WalletRole;

public record WalletResponse(
    Long id,
    String name,
    String description,
    BigDecimal balance,
    LocalDateTime createdAt,
    Long ownerId,
    WalletRole role
) {
    /** @param role the role the authenticated user has in this wallet */
    public WalletResponse(Wallet wallet, WalletRole role) {
        this(
            wallet.getId(), 
            wallet.getName(), 
            wallet.getDescription(),
            wallet.getBalance(),
            wallet.getCreatedAt(),
            wallet.getOwner().getId(),
            role
        );
    }
}
