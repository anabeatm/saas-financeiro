package com.saasfinanceiro.finexp.dto.budget;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;

public record BudgetRequest(
    @NotNull(message = "Monthly limit is required")
    @DecimalMin(value = "0.01", message = "Monthly limit must be greater than zero")
    @Digits(integer = 13, fraction = 2, message = "Monthly limit must have at most 2 decimal places")
    BigDecimal monthlyLimit
) {}
