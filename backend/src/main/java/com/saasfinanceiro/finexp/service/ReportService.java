package com.saasfinanceiro.finexp.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.saasfinanceiro.finexp.dto.report.CategoryBreakdownDTO;
import com.saasfinanceiro.finexp.dto.report.StatementEntryDTO;
import com.saasfinanceiro.finexp.dto.report.StatementReportResponse;
import com.saasfinanceiro.finexp.exceptions.BadRequestException;
import com.saasfinanceiro.finexp.exceptions.ResourceNotFoundException;
import com.saasfinanceiro.finexp.model.Category;
import com.saasfinanceiro.finexp.model.Transaction;
import com.saasfinanceiro.finexp.model.User;
import com.saasfinanceiro.finexp.model.Wallet;
import com.saasfinanceiro.finexp.model.enums.TransactionType;
import com.saasfinanceiro.finexp.repository.TransactionRepository;
import com.saasfinanceiro.finexp.repository.WalletMemberRepository;
import com.saasfinanceiro.finexp.repository.WalletRepository;

/** Builds the wallet statement report. Any member of the wallet (viewers included) can generate it. */
@Service
public class ReportService {

    static final String UNCATEGORIZED = "Uncategorized";
    /** Longest period accepted, so a single report stays a reasonable size (one year, leap years included). */
    static final long MAX_PERIOD_DAYS = 366;

    private static final BigDecimal HUNDRED = BigDecimal.valueOf(100);

    private final TransactionRepository transactionRepository;
    private final WalletRepository walletRepository;
    private final WalletMemberRepository walletMemberRepository;

    public ReportService(TransactionRepository transactionRepository, WalletRepository walletRepository,
            WalletMemberRepository walletMemberRepository) {
        this.transactionRepository = transactionRepository;
        this.walletRepository = walletRepository;
        this.walletMemberRepository = walletMemberRepository;
    }

    @Transactional(readOnly = true)
    public StatementReportResponse getStatement(Long walletId, LocalDate startDate, LocalDate endDate) {
        validatePeriod(startDate, endDate);
        Wallet wallet = findWalletForMember(walletId);

        BigDecimal openingBalance = orZero(
                transactionRepository.sumSignedAmountBefore(walletId, startDate, TransactionType.INCOME));
        List<Transaction> transactions = transactionRepository.findStatementEntries(walletId, startDate, endDate);

        BigDecimal balance = openingBalance;
        BigDecimal totalIncome = BigDecimal.ZERO;
        BigDecimal totalExpense = BigDecimal.ZERO;
        List<StatementEntryDTO> entries = new ArrayList<>(transactions.size());

        for (Transaction t : transactions) {
            boolean income = t.getType() == TransactionType.INCOME;
            balance = income ? balance.add(t.getAmount()) : balance.subtract(t.getAmount());
            if (income) {
                totalIncome = totalIncome.add(t.getAmount());
            } else {
                totalExpense = totalExpense.add(t.getAmount());
            }
            entries.add(new StatementEntryDTO(t.getId(), t.getDate(), t.getType(), t.getDescription(),
                    categoryName(t.getCategory()), t.getCreatedBy().getName(), t.getAmount(), balance));
        }

        BigDecimal netResult = totalIncome.subtract(totalExpense);

        return new StatementReportResponse(wallet.getId(), wallet.getName(), startDate, endDate,
                LocalDateTime.now(), openingBalance, totalIncome, totalExpense, netResult,
                openingBalance.add(netResult), transactions.size(),
                breakdownByCategory(transactions, totalIncome, totalExpense), entries);
    }

    private void validatePeriod(LocalDate startDate, LocalDate endDate) {
        if (startDate.isAfter(endDate)) {
            throw new BadRequestException("startDate must not be after endDate");
        }
        if (ChronoUnit.DAYS.between(startDate, endDate) >= MAX_PERIOD_DAYS) {
            throw new BadRequestException("The report period cannot be longer than one year");
        }
    }

    private Wallet findWalletForMember(Long walletId) {
        Wallet wallet = walletRepository.findById(walletId)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet not found"));

        walletMemberRepository.findByWalletAndUser(wallet, getAuthenticatedUser())
                .orElseThrow(() -> new AccessDeniedException("Access Denied: You are not a member of this wallet"));

        return wallet;
    }

    /**
     * Totals per category, expenses first, each group ordered by the biggest total.
     * The percentage is the category's share of all the expenses (or all the income) of the period.
     */
    private List<CategoryBreakdownDTO> breakdownByCategory(List<Transaction> transactions,
            BigDecimal totalIncome, BigDecimal totalExpense) {
        Map<String, Accumulator> groups = new LinkedHashMap<>();
        for (Transaction t : transactions) {
            Category category = t.getCategory();
            String key = t.getType() + ":" + (category != null ? category.getId() : "none");
            groups.computeIfAbsent(key, k -> new Accumulator(category != null ? category.getId() : null,
                    categoryName(category), t.getType()))
                    .add(t.getAmount());
        }

        return groups.values().stream()
                .map(g -> new CategoryBreakdownDTO(g.categoryId, g.name, g.type, g.total, g.count,
                        percentage(g.total, g.type == TransactionType.INCOME ? totalIncome : totalExpense)))
                .sorted(Comparator
                        .comparing((CategoryBreakdownDTO c) -> c.type() == TransactionType.INCOME)
                        .thenComparing(CategoryBreakdownDTO::total, Comparator.reverseOrder()))
                .toList();
    }

    private static BigDecimal percentage(BigDecimal part, BigDecimal whole) {
        if (whole.signum() == 0) {
            return BigDecimal.ZERO;
        }
        return part.multiply(HUNDRED).divide(whole, 2, RoundingMode.HALF_UP);
    }

    private static String categoryName(Category category) {
        return category != null ? category.getName() : UNCATEGORIZED;
    }

    private static BigDecimal orZero(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }

    private User getAuthenticatedUser() {
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    private static final class Accumulator {
        private final Long categoryId;
        private final String name;
        private final TransactionType type;
        private BigDecimal total = BigDecimal.ZERO;
        private long count;

        private Accumulator(Long categoryId, String name, TransactionType type) {
            this.categoryId = categoryId;
            this.name = name;
            this.type = type;
        }

        private Accumulator add(BigDecimal amount) {
            total = total.add(amount);
            count++;
            return this;
        }
    }
}
