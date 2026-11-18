package com.saasfinanceiro.finexp.dto.ai;

import com.saasfinanceiro.finexp.model.enums.TransactionType;

/** A category the AI proposes to create when none of the user's categories fits the description. */
public record NewCategorySuggestion(String name, TransactionType type, String icon, String color) {}
