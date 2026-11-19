package com.saasfinanceiro.finexp.dto.ai;

import com.saasfinanceiro.finexp.model.enums.TransactionType;

/** categoria nova sugerida pela ia */
public record NewCategorySuggestion(String name, TransactionType type, String icon, String color) {}
