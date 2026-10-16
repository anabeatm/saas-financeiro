package com.saasfinanceiro.finexp.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.saasfinanceiro.finexp.model.Transaction;

public interface TransactionRepository
        extends JpaRepository<Transaction, Long>, JpaSpecificationExecutor<Transaction> {

    List<Transaction> findAllByWalletIdAndDateBetween(Long walletId, LocalDate startDate, LocalDate endDate);
}
