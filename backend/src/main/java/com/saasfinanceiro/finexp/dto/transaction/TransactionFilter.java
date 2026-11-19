package com.saasfinanceiro.finexp.dto.transaction;

import java.time.LocalDate;

import org.springframework.format.annotation.DateTimeFormat;

import com.saasfinanceiro.finexp.model.enums.TransactionType;

/** filtros opcionais da lista de transações (null = sem filtro) */
public record TransactionFilter(
    TransactionType type,
    Long categoryId,
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
) {}
