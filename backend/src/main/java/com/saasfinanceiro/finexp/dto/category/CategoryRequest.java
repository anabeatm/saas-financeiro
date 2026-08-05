package com.saasfinanceiro.finexp.dto.category;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import com.saasfinanceiro.finexp.model.enums.TransactionType;

public record CategoryRequest(
    @NotBlank(message = "Category name is required") 
    @Size(max = 80, message = "Name cannot exceed 80 characters") 
    String name,

    @NotNull(message = "Transaction type is required (INCOME or EXPENSE)") 
    TransactionType type,

    String color,
    
    String icon
) {}
