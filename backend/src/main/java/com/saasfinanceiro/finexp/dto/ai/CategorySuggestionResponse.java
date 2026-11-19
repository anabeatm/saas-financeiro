package com.saasfinanceiro.finexp.dto.ai;

import com.saasfinanceiro.finexp.model.enums.TransactionType;

/** categoria sugerida, ou uma nova em {@code newCategory}; tudo null se nada servir */
public record CategorySuggestionResponse(Long categoryId, String categoryName, TransactionType type,
        NewCategorySuggestion newCategory) {

    public static CategorySuggestionResponse existing(Long id, String name, TransactionType type) {
        return new CategorySuggestionResponse(id, name, type, null);
    }

    public static CategorySuggestionResponse proposeNew(NewCategorySuggestion newCategory) {
        return new CategorySuggestionResponse(null, null, null, newCategory);
    }

    public static CategorySuggestionResponse none() {
        return new CategorySuggestionResponse(null, null, null, null);
    }
}
