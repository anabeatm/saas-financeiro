package com.saasfinanceiro.finexp.realtime;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.saasfinanceiro.finexp.model.enums.TransactionType;

/** evento mandado pros membros quando algo muda na carteira */
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
