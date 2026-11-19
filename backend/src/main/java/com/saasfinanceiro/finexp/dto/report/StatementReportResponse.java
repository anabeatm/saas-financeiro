package com.saasfinanceiro.finexp.dto.report;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/** extrato da carteira: saldo inicial, transações, totais e categorias */
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
