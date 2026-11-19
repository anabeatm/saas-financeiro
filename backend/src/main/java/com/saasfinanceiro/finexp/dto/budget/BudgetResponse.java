package com.saasfinanceiro.finexp.dto.budget;

import java.math.BigDecimal;

/**
 * A category's budget and its spending in the requested month. {@code status}: OK below 80% of the
 * limit, WARNING from 80% up to the limit, EXCEEDED above it.
 */
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
