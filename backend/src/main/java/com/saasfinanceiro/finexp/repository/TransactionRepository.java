package com.saasfinanceiro.finexp.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.saasfinanceiro.finexp.model.Transaction;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    
    Page<Transaction> findAllByWalletId(Long walletId, Pageable pageable);

    List<Transaction> findAllByWalletIdAndDateBetween(Long walletId, LocalDate startDate, LocalDate endDate);
}
