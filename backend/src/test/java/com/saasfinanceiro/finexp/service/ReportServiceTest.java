package com.saasfinanceiro.finexp.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import com.saasfinanceiro.finexp.dto.report.CategoryBreakdownDTO;
import com.saasfinanceiro.finexp.dto.report.StatementReportResponse;
import com.saasfinanceiro.finexp.exceptions.BadRequestException;
import com.saasfinanceiro.finexp.exceptions.ResourceNotFoundException;
import com.saasfinanceiro.finexp.model.Category;
import com.saasfinanceiro.finexp.model.Transaction;
import com.saasfinanceiro.finexp.model.User;
import com.saasfinanceiro.finexp.model.Wallet;
import com.saasfinanceiro.finexp.model.WalletMember;
import com.saasfinanceiro.finexp.model.enums.TransactionType;
import com.saasfinanceiro.finexp.model.enums.WalletRole;
import com.saasfinanceiro.finexp.repository.TransactionRepository;
import com.saasfinanceiro.finexp.repository.WalletMemberRepository;
import com.saasfinanceiro.finexp.repository.WalletRepository;

class ReportServiceTest {

    private static final Long WALLET_ID = 3L;
    private static final LocalDate START = LocalDate.of(2025, 1, 1);
    private static final LocalDate END = LocalDate.of(2025, 1, 31);

    private TransactionRepository transactionRepository;
    private WalletRepository walletRepository;
    private WalletMemberRepository walletMemberRepository;
    private ReportService service;

    private User user;
    private Wallet wallet;
    private Category salary;
    private Category food;

    @BeforeEach
    void setUp() {
        transactionRepository = mock(TransactionRepository.class);
        walletRepository = mock(WalletRepository.class);
        walletMemberRepository = mock(WalletMemberRepository.class);
        service = new ReportService(transactionRepository, walletRepository, walletMemberRepository);

        user = new User();
        user.setId(7L);
        user.setName("Ana Silva");
        SecurityContextHolder.getContext()
                .setAuthentication(new UsernamePasswordAuthenticationToken(user, null, List.of()));

        wallet = new Wallet();
        wallet.setId(WALLET_ID);
        wallet.setName("Household");
        wallet.setOwner(user);

        salary = category(1L, "Salary", TransactionType.INCOME);
        food = category(2L, "Food", TransactionType.EXPENSE);

        when(walletRepository.findById(WALLET_ID)).thenReturn(Optional.of(wallet));
        when(walletMemberRepository.findByWalletAndUser(wallet, user)).thenReturn(Optional.of(member(WalletRole.VIEWER)));
    }

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void computesOpeningBalanceRunningBalanceAndTotals() {
        when(transactionRepository.sumSignedAmountBefore(WALLET_ID, START, TransactionType.INCOME))
                .thenReturn(new BigDecimal("500.00"));
        when(transactionRepository.findStatementEntries(WALLET_ID, START, END)).thenReturn(List.of(
                transaction(10L, TransactionType.INCOME, "1000.00", 5, salary),
                transaction(11L, TransactionType.EXPENSE, "150.00", 10, food),
                transaction(12L, TransactionType.EXPENSE, "50.00", 12, null)));

        StatementReportResponse report = service.getStatement(WALLET_ID, START, END);

        assertEquals("Household", report.walletName());
        assertEquals(new BigDecimal("500.00"), report.openingBalance());
        assertEquals(new BigDecimal("1000.00"), report.totalIncome());
        assertEquals(new BigDecimal("200.00"), report.totalExpense());
        assertEquals(new BigDecimal("800.00"), report.netResult());
        assertEquals(new BigDecimal("1300.00"), report.closingBalance());
        assertEquals(3, report.transactionCount());

        assertEquals(new BigDecimal("1500.00"), report.entries().get(0).balanceAfter());
        assertEquals(new BigDecimal("1350.00"), report.entries().get(1).balanceAfter());
        assertEquals(new BigDecimal("1300.00"), report.entries().get(2).balanceAfter());
        assertEquals(ReportService.UNCATEGORIZED, report.entries().get(2).categoryName());
        assertEquals("Ana Silva", report.entries().get(0).createdBy());
    }

    @Test
    void openingBalanceIsZeroWhenThereIsNoEarlierTransaction() {
        when(transactionRepository.sumSignedAmountBefore(WALLET_ID, START, TransactionType.INCOME)).thenReturn(null);
        when(transactionRepository.findStatementEntries(WALLET_ID, START, END)).thenReturn(List.of());

        StatementReportResponse report = service.getStatement(WALLET_ID, START, END);

        assertEquals(BigDecimal.ZERO, report.openingBalance());
        assertEquals(BigDecimal.ZERO, report.closingBalance());
        assertEquals(0, report.transactionCount());
        assertEquals(List.of(), report.byCategory());
    }

    @Test
    void groupsByCategoryWithShareOfEachType() {
        when(transactionRepository.findStatementEntries(WALLET_ID, START, END)).thenReturn(List.of(
                transaction(10L, TransactionType.INCOME, "1000.00", 5, salary),
                transaction(11L, TransactionType.EXPENSE, "150.00", 10, food),
                transaction(12L, TransactionType.EXPENSE, "50.00", 11, food),
                transaction(13L, TransactionType.EXPENSE, "100.00", 12, null)));

        List<CategoryBreakdownDTO> byCategory = service.getStatement(WALLET_ID, START, END).byCategory();

        // expenses first, biggest total first; incomes after
        assertEquals(3, byCategory.size());

        CategoryBreakdownDTO foodTotal = byCategory.get(0);
        assertEquals("Food", foodTotal.categoryName());
        assertEquals(new BigDecimal("200.00"), foodTotal.total());
        assertEquals(2, foodTotal.count());
        assertEquals(new BigDecimal("66.67"), foodTotal.percentage());

        CategoryBreakdownDTO uncategorized = byCategory.get(1);
        assertNull(uncategorized.categoryId());
        assertEquals(ReportService.UNCATEGORIZED, uncategorized.categoryName());
        assertEquals(new BigDecimal("33.33"), uncategorized.percentage());

        CategoryBreakdownDTO salaryTotal = byCategory.get(2);
        assertEquals(TransactionType.INCOME, salaryTotal.type());
        assertEquals(new BigDecimal("100.00"), salaryTotal.percentage());
    }

    @Test
    void rejectsStartDateAfterEndDate() {
        assertThrows(BadRequestException.class, () -> service.getStatement(WALLET_ID, END, START));
        verify(transactionRepository, never()).findStatementEntries(any(), any(), any());
    }

    @Test
    void rejectsPeriodLongerThanOneYear() {
        LocalDate start = LocalDate.of(2024, 1, 1);

        assertThrows(BadRequestException.class, () -> service.getStatement(WALLET_ID, start, start.plusDays(366)));
    }

    @Test
    void acceptsAFullLeapYear() {
        LocalDate start = LocalDate.of(2024, 1, 1);
        when(transactionRepository.findStatementEntries(any(), any(), any())).thenReturn(List.of());

        service.getStatement(WALLET_ID, start, LocalDate.of(2024, 12, 31));
    }

    @Test
    void deniesUsersWhoAreNotMembers() {
        when(walletMemberRepository.findByWalletAndUser(wallet, user)).thenReturn(Optional.empty());

        assertThrows(AccessDeniedException.class, () -> service.getStatement(WALLET_ID, START, END));
        verify(transactionRepository, never()).findStatementEntries(any(), any(), any());
    }

    @Test
    void failsWhenTheWalletDoesNotExist() {
        when(walletRepository.findById(WALLET_ID)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> service.getStatement(WALLET_ID, START, END));
    }

    private Category category(Long id, String name, TransactionType type) {
        Category category = new Category();
        category.setId(id);
        category.setName(name);
        category.setType(type);
        category.setUser(user);
        return category;
    }

    private WalletMember member(WalletRole role) {
        WalletMember member = new WalletMember();
        member.setWallet(wallet);
        member.setUser(user);
        member.setRole(role);
        return member;
    }

    private Transaction transaction(Long id, TransactionType type, String amount, int day, Category category) {
        Transaction t = new Transaction();
        t.setId(id);
        t.setWallet(wallet);
        t.setType(type);
        t.setAmount(new BigDecimal(amount));
        t.setDate(LocalDate.of(2025, 1, day));
        t.setDescription("tx " + id);
        t.setCategory(category);
        t.setCreatedBy(user);
        return t;
    }
}
