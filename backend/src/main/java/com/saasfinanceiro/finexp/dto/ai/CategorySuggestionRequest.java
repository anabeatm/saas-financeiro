package com.saasfinanceiro.finexp.dto.ai;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import com.saasfinanceiro.finexp.model.enums.TransactionType;

/** descrição da transação + tipo (receita/despesa) */
public record CategorySuggestionRequest(
    @NotBlank(message = "Description is required")
    @Size(max = 255, message = "Description cannot exceed 255 characters")
    String description,

    TransactionType type
) {}
