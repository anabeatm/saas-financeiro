package com.saasfinanceiro.finexp.dto.dashboard;

import java.math.BigDecimal;

public record MonthSummaryDTO(
    String month, 
    BigDecimal income, 
    BigDecimal expense
) {}
