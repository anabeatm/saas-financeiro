package com.saasfinanceiro.finexp.dto.report;

import java.math.BigDecimal;

import com.saasfinanceiro.finexp.model.enums.TransactionType;

/** total da categoria no período e quanto (%) ela representa */
public record CategoryBreakdownDTO(
    Long categoryId,
    String categoryName,
    TransactionType type,
    BigDecimal total,
    long count,
    BigDecimal percentage
) {}
