package com.saasfinanceiro.finexp.dto.dashboard;

import java.math.BigDecimal;

public record CategorySummaryDTO(
    Long categoryId, 
    String categoryName, 
    BigDecimal total
) {}
