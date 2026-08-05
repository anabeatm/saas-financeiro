package com.saasfinanceiro.finexp.dto.transaction;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.saasfinanceiro.finexp.model.Transaction;
import com.saasfinanceiro.finexp.model.enums.TransactionType;

public record TransactionResponse(
    Long id,
    TransactionType type,
    BigDecimal amount,
    String description,
    LocalDate date,
    Long categoryId,
    String categoryName,
    String createdBy
) {
    public TransactionResponse(Transaction t) {
        this(
            t.getId(),
            t.getType(),
            t.getAmount(),
            t.getDescription(),
            t.getDate(),
            t.getCategory() != null ? t.getCategory().getId() : null,
            t.getCategory() != null ? t.getCategory().getName() : null,
            t.getCreatedBy().getName()
        );
    }
}
