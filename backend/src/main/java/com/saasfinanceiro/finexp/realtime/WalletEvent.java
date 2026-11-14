package com.saasfinanceiro.finexp.realtime;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.saasfinanceiro.finexp.model.enums.TransactionType;

/**
 * Payload pushed to every member of a wallet when something changes in it. It carries just enough
 * for a notification; the screens reload their data from the API when they receive it.
 * Transaction fields are only filled for TRANSACTION_* events, {@code affectedUserId} only for MEMBER_* events.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record WalletEvent(
    WalletEventType type,
    Long walletId,
    String walletName,
    Long actorId,
    String actorName,
    TransactionType transactionType,
    BigDecimal amount,
    String description,
    Long affectedUserId,
    LocalDateTime occurredAt
) {}
