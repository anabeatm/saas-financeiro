package com.saasfinanceiro.finexp.dto.ai;

import com.saasfinanceiro.finexp.model.enums.TransactionType;

/**
 * Result of the category suggestion: either an existing category of the user ({@code categoryId},
 * {@code categoryName}, {@code type}) or, when none fits, a proposal for a new one ({@code newCategory}).
 * All fields are null when the AI had nothing useful to suggest.
 */
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
