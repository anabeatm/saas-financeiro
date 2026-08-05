package com.saasfinanceiro.finexp.dto.category;

import com.saasfinanceiro.finexp.model.Category;
import com.saasfinanceiro.finexp.model.enums.TransactionType;

public record CategoryResponse(
    Long id,
    String name,
    TransactionType type,
    String color,
    String icon
) {
    public CategoryResponse(Category category) {
        this(category.getId(), category.getName(), category.getType(), category.getColor(), category.getIcon());
    }
}
