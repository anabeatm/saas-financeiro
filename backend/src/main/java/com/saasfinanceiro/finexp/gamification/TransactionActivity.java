package com.saasfinanceiro.finexp.gamification;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.saasfinanceiro.finexp.model.enums.TransactionType;

/**
 * Application events published by the transaction service. They carry plain values because they are
 * handled after the commit, outside the persistence context that loaded the transaction.
 */
public final class TransactionActivity {

    private TransactionActivity() {
    }

    public record Created(Long transactionId, Long userId, TransactionType type, BigDecimal amount,
            LocalDate date, Long categoryId) {}

    /** {@code creatorId} is who created the transaction (and earned its XP), not who deleted it. */
    public record Deleted(Long transactionId, Long creatorId) {}
}
