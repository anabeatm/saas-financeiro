package com.saasfinanceiro.finexp.dto.transaction;

import java.time.LocalDate;

import org.springframework.format.annotation.DateTimeFormat;

import com.saasfinanceiro.finexp.model.enums.TransactionType;

/** Optional query parameters accepted by the transaction listing; null means "no filter". */
public record TransactionFilter(
    TransactionType type,
    Long categoryId,
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
) {}
