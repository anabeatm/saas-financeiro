package com.saasfinanceiro.finexp.dto.report;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Wallet statement for a period: balance before the period, every transaction in date order with
 * the running balance, totals and a breakdown by category.
 */
public record StatementReportResponse(
    Long walletId,
    String walletName,
    LocalDate startDate,
    LocalDate endDate,
    LocalDateTime generatedAt,
    BigDecimal openingBalance,
    BigDecimal totalIncome,
    BigDecimal totalExpense,
    BigDecimal netResult,
    BigDecimal closingBalance,
    int transactionCount,
    List<CategoryBreakdownDTO> byCategory,
    List<StatementEntryDTO> entries
) {}
