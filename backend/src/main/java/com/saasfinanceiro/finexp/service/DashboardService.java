package com.saasfinanceiro.finexp.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.saasfinanceiro.finexp.dto.dashboard.CategorySummaryDTO;
import com.saasfinanceiro.finexp.dto.dashboard.DashboardSummaryResponse;
import com.saasfinanceiro.finexp.dto.dashboard.MonthSummaryDTO;
import com.saasfinanceiro.finexp.model.Transaction;
import com.saasfinanceiro.finexp.model.User;
import com.saasfinanceiro.finexp.model.Wallet;
import com.saasfinanceiro.finexp.model.enums.TransactionType;
import com.saasfinanceiro.finexp.repository.TransactionRepository;
import com.saasfinanceiro.finexp.repository.WalletMemberRepository;
import com.saasfinanceiro.finexp.repository.WalletRepository;

@Service
public class DashboardService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private WalletMemberRepository walletMemberRepository;

    private User getAuthenticatedUser() {
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    public DashboardSummaryResponse getSummary(Long walletId, LocalDate startDate, LocalDate endDate) {

        Wallet wallet = walletRepository.findById(walletId)
                .orElseThrow(() -> new RuntimeException("Wallet not found"));

        walletMemberRepository.findByWalletAndUser(wallet, getAuthenticatedUser())
                .orElseThrow(() -> new RuntimeException("Access Denied: You are not a member of this wallet"));
        List<Transaction> transactions = transactionRepository.findAllByWalletIdAndDateBetween(walletId, startDate, endDate);

        BigDecimal totalIncome = transactions.stream()
                .filter(t -> t.getType() == TransactionType.INCOME)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalExpense = transactions.stream()
                .filter(t -> t.getType() == TransactionType.EXPENSE)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal balance = totalIncome.subtract(totalExpense);
        int transactionCount = transactions.size();

        List<CategorySummaryDTO> byCategory = transactions.stream()
                .filter(t -> t.getCategory() != null)
                .collect(Collectors.groupingBy(
                        Transaction::getCategory,
                        Collectors.reducing(BigDecimal.ZERO, Transaction::getAmount, BigDecimal::add)
                ))
                .entrySet().stream()
                .map(e -> new CategorySummaryDTO(e.getKey().getId(), e.getKey().getName(), e.getValue()))
                .collect(Collectors.toList());

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM");
        List<MonthSummaryDTO> byMonth = transactions.stream()
                .collect(Collectors.groupingBy(t -> t.getDate().format(formatter)))
                .entrySet().stream()
                .map(e -> {
                    String month = e.getKey();
                    BigDecimal inc = e.getValue().stream()
                            .filter(t -> t.getType() == TransactionType.INCOME)
                            .map(Transaction::getAmount)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    
                    BigDecimal exp = e.getValue().stream()
                            .filter(t -> t.getType() == TransactionType.EXPENSE)
                            .map(Transaction::getAmount)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    
                    return new MonthSummaryDTO(month, inc, exp);
                })
                .sorted((m1, m2) -> m1.month().compareTo(m2.month()))
                .collect(Collectors.toList());

        return new DashboardSummaryResponse(
                totalIncome, totalExpense, balance, transactionCount, byCategory, byMonth
        );
    }
}
