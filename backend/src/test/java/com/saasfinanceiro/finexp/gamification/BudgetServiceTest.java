package com.saasfinanceiro.finexp.gamification;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import com.saasfinanceiro.finexp.dto.budget.BudgetResponse;
import com.saasfinanceiro.finexp.dto.budget.BudgetResponse.BudgetStatus;
import com.saasfinanceiro.finexp.exceptions.BadRequestException;
import com.saasfinanceiro.finexp.exceptions.BusinessException;
import com.saasfinanceiro.finexp.exceptions.ResourceNotFoundException;
import com.saasfinanceiro.finexp.model.Budget;
import com.saasfinanceiro.finexp.model.Category;
import com.saasfinanceiro.finexp.model.User;
import com.saasfinanceiro.finexp.model.enums.TransactionType;
import com.saasfinanceiro.finexp.realtime.GamificationEvent;
import com.saasfinanceiro.finexp.realtime.GamificationEventPublisher;
import com.saasfinanceiro.finexp.realtime.GamificationEventType;
import com.saasfinanceiro.finexp.repository.BudgetRepository;
import com.saasfinanceiro.finexp.repository.CategoryRepository;
import com.saasfinanceiro.finexp.repository.TransactionRepository;

class BudgetServiceTest {

    private static final Instant NOW = Instant.parse("2026-11-18T15:00:00Z");
    private static final LocalDate TODAY = LocalDate.of(2026, 11, 18);
    private static final Long FOOD_ID = 2L;

    private BudgetRepository budgetRepository;
    private CategoryRepository categoryRepository;
    private TransactionRepository transactionRepository;
    private GamificationEventPublisher publisher;
    private BudgetService service;

    private User user;
    private Category food;

    @BeforeEach
    void setUp() {
        budgetRepository = mock(BudgetRepository.class);
        categoryRepository = mock(CategoryRepository.class);
        transactionRepository = mock(TransactionRepository.class);
        publisher = mock(GamificationEventPublisher.class);
        service = new BudgetService(budgetRepository, categoryRepository, transactionRepository, publisher,
                Clock.fixed(NOW, ZoneId.of("America/Sao_Paulo")));

        user = new User();
        user.setId(7L);
        food = category(FOOD_ID, TransactionType.EXPENSE, user);

        Budget budget = new Budget();
        budget.setCategory(food);
        budget.setMonthlyLimit(new BigDecimal("100.00"));
        when(budgetRepository.findByCategoryId(FOOD_ID)).thenReturn(Optional.of(budget));
        when(budgetRepository.findAllByUserId(7L)).thenReturn(List.of(budget));
    }

    // ------------------------------------------------------------ alerts

    @Test
    void expenseCrossingEightyPercentWarns() {
        spentThisMonth("85.00");

        service.onTransactionCreated(expense("10.00", TODAY));

        GamificationEvent alert = publishedAlert();
        assertEquals(GamificationEventType.BUDGET_WARNING, alert.type());
        assertEquals(85, alert.percent());
        assertEquals("Food", alert.categoryName());
    }

    @Test
    void expenseAlreadyAboveEightyPercentDoesNotWarnAgain() {
        spentThisMonth("90.00");

        service.onTransactionCreated(expense("5.00", TODAY));

        verify(publisher, never()).publish(any(), any());
    }

    @Test
    void expenseGoingOverTheLimitAlertsExceeded() {
        spentThisMonth("105.00");

        service.onTransactionCreated(expense("10.00", TODAY));

        assertEquals(GamificationEventType.BUDGET_EXCEEDED, publishedAlert().type());
    }

    @Test
    void reachingExactlyTheLimitIsOnlyAWarning() {
        spentThisMonth("100.00");

        service.onTransactionCreated(expense("30.00", TODAY));

        assertEquals(GamificationEventType.BUDGET_WARNING, publishedAlert().type());
    }

    @Test
    void expensesOfOtherMonthsAndIncomesAreIgnored() {
        spentThisMonth("500.00");

        service.onTransactionCreated(expense("10.00", TODAY.minusMonths(1)));
        service.onTransactionCreated(new TransactionActivity.Created(1L, 7L, TransactionType.INCOME,
                new BigDecimal("10.00"), TODAY, FOOD_ID));

        verify(publisher, never()).publish(any(), any());
    }

    // ------------------------------------------------------------ CRUD

    @Test
    void listShowsSpendingPercentAndStatus() {
        when(transactionRepository.sumByCategory(7L, TransactionType.EXPENSE, LocalDate.of(2026, 11, 1),
                LocalDate.of(2026, 11, 30))).thenReturn(List.of(new TransactionRepository.CategoryTotal() {
                    public Long getCategoryId() { return FOOD_ID; }
                    public BigDecimal getTotal() { return new BigDecimal("80.00"); }
                }));

        BudgetResponse response = service.list(user, null).get(0);

        assertEquals("2026-11", response.month());
        assertEquals(80, response.percent());
        assertEquals(BudgetStatus.WARNING, response.status());
    }

    @Test
    void listRejectsAMalformedMonth() {
        assertThrows(BadRequestException.class, () -> service.list(user, "11/2026"));
    }

    @Test
    void budgetsCanOnlyBeSetOnExpenseCategories() {
        when(categoryRepository.findById(5L)).thenReturn(Optional.of(category(5L, TransactionType.INCOME, user)));

        assertThrows(BusinessException.class, () -> service.save(user, 5L, new BigDecimal("100")));
    }

    @Test
    void categoriesOfOtherUsersLookMissing() {
        User other = new User();
        other.setId(99L);
        when(categoryRepository.findById(5L)).thenReturn(Optional.of(category(5L, TransactionType.EXPENSE, other)));

        assertThrows(ResourceNotFoundException.class, () -> service.save(user, 5L, new BigDecimal("100")));
        verify(budgetRepository, never()).save(any());
    }

    // ------------------------------------------------------------ helpers

    private void spentThisMonth(String total) {
        when(transactionRepository.sumByCategoryId(eq(FOOD_ID), eq(TransactionType.EXPENSE),
                eq(LocalDate.of(2026, 11, 1)), eq(LocalDate.of(2026, 11, 30)))).thenReturn(new BigDecimal(total));
    }

    private static TransactionActivity.Created expense(String amount, LocalDate date) {
        return new TransactionActivity.Created(1L, 7L, TransactionType.EXPENSE, new BigDecimal(amount), date,
                FOOD_ID);
    }

    private GamificationEvent publishedAlert() {
        ArgumentCaptor<GamificationEvent> captor = ArgumentCaptor.forClass(GamificationEvent.class);
        verify(publisher).publish(eq(7L), captor.capture());
        return captor.getValue();
    }

    private static Category category(Long id, TransactionType type, User owner) {
        Category category = new Category();
        category.setId(id);
        category.setName("Food");
        category.setType(type);
        category.setUser(owner);
        return category;
    }
}
