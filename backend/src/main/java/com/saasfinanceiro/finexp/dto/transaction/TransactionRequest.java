package com.saasfinanceiro.finexp.dto.transaction;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;

import com.saasfinanceiro.finexp.model.enums.TransactionType;

public record TransactionRequest(
    @NotNull(message = "Type is required")
    TransactionType type,
    
    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than zero")
    BigDecimal amount,
    
    String description,
    
    @NotNull(message = "Date is required")
    @PastOrPresent(message = "Date cannot be in the future")
    LocalDate date,
    
    Long categoryId
) {}
