package com.saasfinanceiro.finexp.gamification;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.saasfinanceiro.finexp.model.enums.TransactionType;

/** eventos de quando uma transação é criada ou apagada */
public final class TransactionActivity {

    private TransactionActivity() {
    }

    public record Created(Long transactionId, Long userId, TransactionType type, BigDecimal amount,
            LocalDate date, Long categoryId) {}

    /** {@code creatorId} é quem criou a transação (não quem apagou) */
    public record Deleted(Long transactionId, Long creatorId) {}
}
