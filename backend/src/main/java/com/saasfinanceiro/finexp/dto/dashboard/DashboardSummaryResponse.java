package com.saasfinanceiro.finexp.dto.dashboard;

import java.math.BigDecimal;
import java.util.List;

public record DashboardSummaryResponse(
    BigDecimal totalIncome,
    BigDecimal totalExpense,
    BigDecimal balance,
    int transactionCount,
    List<CategorySummaryDTO> byCategory,
    List<MonthSummaryDTO> byMonth
) {}
