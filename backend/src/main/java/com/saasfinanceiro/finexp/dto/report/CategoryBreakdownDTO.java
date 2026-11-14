package com.saasfinanceiro.finexp.dto.report;

import java.math.BigDecimal;

import com.saasfinanceiro.finexp.model.enums.TransactionType;

/**
 * Total of one category in the period. {@code percentage} is its share of all the income
 * (or all the expenses) in the period. Transactions without a category have a null id.
 */
public record CategoryBreakdownDTO(
    Long categoryId,
    String categoryName,
    TransactionType type,
    BigDecimal total,
    long count,
    BigDecimal percentage
) {}
