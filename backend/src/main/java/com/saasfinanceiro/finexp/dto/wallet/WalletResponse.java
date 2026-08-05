package com.saasfinanceiro.finexp.dto.wallet;

import java.time.LocalDateTime;

import com.saasfinanceiro.finexp.model.Wallet;

public record WalletResponse(
    Long id,
    String name,
    String description,
    LocalDateTime createdAt,
    Long ownerId
) {
    public WalletResponse(Wallet wallet) {
        this(
            wallet.getId(), 
            wallet.getName(), 
            wallet.getDescription(), 
            wallet.getCreatedAt(),
            wallet.getOwner().getId()
        );
    }
}
