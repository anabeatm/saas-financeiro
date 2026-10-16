package com.saasfinanceiro.finexp.repository;

import org.springframework.data.jpa.domain.Specification;

import com.saasfinanceiro.finexp.dto.transaction.TransactionFilter;
import com.saasfinanceiro.finexp.model.Transaction;

public final class TransactionSpecifications {

    private TransactionSpecifications() {
    }

    public static Specification<Transaction> matching(Long walletId, TransactionFilter filter) {
        Specification<Transaction> spec = (root, query, cb) -> cb.equal(root.get("wallet").get("id"), walletId);

        if (filter.type() != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("type"), filter.type()));
        }
        if (filter.categoryId() != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("category").get("id"), filter.categoryId()));
        }
        if (filter.startDate() != null) {
            spec = spec.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("date"), filter.startDate()));
        }
        if (filter.endDate() != null) {
            spec = spec.and((root, query, cb) -> cb.lessThanOrEqualTo(root.get("date"), filter.endDate()));
        }
        return spec;
    }
}
