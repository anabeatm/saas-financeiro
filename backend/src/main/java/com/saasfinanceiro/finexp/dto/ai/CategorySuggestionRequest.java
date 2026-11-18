package com.saasfinanceiro.finexp.dto.ai;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import com.saasfinanceiro.finexp.model.enums.TransactionType;

/** Description typed in the transaction form; {@code type} narrows the choice to income or expense categories. */
public record CategorySuggestionRequest(
    @NotBlank(message = "Description is required")
    @Size(max = 255, message = "Description cannot exceed 255 characters")
    String description,

    TransactionType type
) {}
