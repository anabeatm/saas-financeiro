package com.saasfinanceiro.finexp.dto.category;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import com.saasfinanceiro.finexp.model.enums.TransactionType;

public record CategoryRequest(
    @NotBlank(message = "Category name is required") 
    @Size(max = 80, message = "Name cannot exceed 80 characters") 
    String name,

    @NotNull(message = "Transaction type is required (INCOME or EXPENSE)") 
    TransactionType type,

    // só aceita #RRGGBB
    @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "Color must be a hex code like #FF5733")
    String color,
    
    @Size(max = 40, message = "Icon cannot exceed 40 characters")
    @Pattern(regexp = "^[a-z0-9-]+$", message = "Icon must be an icon name like shopping-cart")
    String icon
) {}
