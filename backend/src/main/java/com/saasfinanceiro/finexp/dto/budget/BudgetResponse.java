package com.saasfinanceiro.finexp.dto.budget;

import java.math.BigDecimal;

/** orçamento + gasto do mês. status: OK (<80%), WARNING (80-100%), EXCEEDED (>100%) */
public record BudgetResponse(
    Long categoryId,
    String categoryName,
    String color,
    String icon,
    String month,
    BigDecimal monthlyLimit,
    BigDecimal spent,
    int percent,
    BudgetStatus status
) {
    public enum BudgetStatus { OK, WARNING, EXCEEDED }
}
