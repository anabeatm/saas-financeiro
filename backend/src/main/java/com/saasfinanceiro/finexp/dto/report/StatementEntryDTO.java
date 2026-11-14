package com.saasfinanceiro.finexp.dto.report;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.saasfinanceiro.finexp.model.enums.TransactionType;

/** One line of the statement; {@code balanceAfter} is the wallet balance right after this transaction. */
public record StatementEntryDTO(
    Long id,
    LocalDate date,
    TransactionType type,
    String description,
    String categoryName,
    String createdBy,
    BigDecimal amount,
    BigDecimal balanceAfter
) {}
