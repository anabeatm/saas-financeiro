package com.saasfinanceiro.finexp.gamification;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Clock;
import java.time.Instant;
import java.time.YearMonth;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

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

/** Monthly limits per expense category, and the alerts when spending gets close to or over them. */
@Service
public class BudgetService {

    static final BigDecimal WARNING_RATIO = new BigDecimal("0.80");

    private final BudgetRepository budgetRepository;
    private final CategoryRepository categoryRepository;
    private final TransactionRepository transactionRepository;
    private final GamificationEventPublisher publisher;
    private final Clock clock;

    public BudgetService(BudgetRepository budgetRepository, CategoryRepository categoryRepository,
            TransactionRepository transactionRepository, GamificationEventPublisher publisher, Clock clock) {
        this.budgetRepository = budgetRepository;
        this.categoryRepository = categoryRepository;
        this.transactionRepository = transactionRepository;
        this.publisher = publisher;
        this.clock = clock;
    }

    /** @param month {@code yyyy-MM}; the current month when null */
    @Transactional(readOnly = true)
    public List<BudgetResponse> list(User user, String month) {
        YearMonth period = parseMonth(month);
        Map<Long, BigDecimal> spent = transactionRepository
                .sumByCategory(user.getId(), TransactionType.EXPENSE, period.atDay(1), period.atEndOfMonth())
                .stream()
                .collect(Collectors.toMap(TransactionRepository.CategoryTotal::getCategoryId,
                        TransactionRepository.CategoryTotal::getTotal));

        return budgetRepository.findAllByUserId(user.getId()).stream()
                .map(b -> toResponse(b, period, spent.getOrDefault(b.getCategory().getId(), BigDecimal.ZERO)))
                .toList();
    }

    @Transactional
    public BudgetResponse save(User user, Long categoryId, BigDecimal monthlyLimit) {
        Category category = categoryRepository.findById(categoryId)
                .filter(c -> c.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        if (category.getType() != TransactionType.EXPENSE) {
            throw new BusinessException("Budgets can only be set on expense categories");
        }

        Budget budget = budgetRepository.findByCategoryId(categoryId).orElseGet(() -> {
            Budget created = new Budget();
            created.setCategory(category);
            return created;
        });
        budget.setMonthlyLimit(monthlyLimit);
        budget = budgetRepository.save(budget);

        YearMonth current = YearMonth.now(clock);
        return toResponse(budget, current, spentIn(categoryId, current));
    }

    @Transactional
    public void delete(User user, Long categoryId) {
        Budget budget = budgetRepository.findByCategoryId(categoryId)
                .filter(b -> b.getCategory().getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found"));
        budgetRepository.delete(budget);
    }

    /**
     * Runs after a transaction was committed. Alerts the owner when this expense made the month's
     * spending cross 80% of the limit or go over it; since only the crossing alerts, nobody is told
     * the same thing twice and no alert state has to be stored.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW, readOnly = true)
    public void onTransactionCreated(TransactionActivity.Created event) {
        if (event.type() != TransactionType.EXPENSE || event.categoryId() == null) {
            return;
        }
        YearMonth current = YearMonth.now(clock);
        if (!YearMonth.from(event.date()).equals(current)) {
            return;
        }
        Budget budget = budgetRepository.findByCategoryId(event.categoryId()).orElse(null);
        if (budget == null) {
            return;
        }

        BigDecimal limit = budget.getMonthlyLimit();
        BigDecimal after = spentIn(event.categoryId(), current);
        BigDecimal before = after.subtract(event.amount());
        BigDecimal warningLine = limit.multiply(WARNING_RATIO);

        GamificationEventType alert = null;
        if (before.compareTo(limit) <= 0 && after.compareTo(limit) > 0) {
            alert = GamificationEventType.BUDGET_EXCEEDED;
        } else if (before.compareTo(warningLine) < 0 && after.compareTo(warningLine) >= 0) {
            alert = GamificationEventType.BUDGET_WARNING;
        }
        if (alert != null) {
            Category category = budget.getCategory();
            publisher.publish(category.getUser().getId(), GamificationEvent.budget(alert, category.getId(),
                    category.getName(), percent(after, limit), Instant.now(clock)));
        }
    }

    private BigDecimal spentIn(Long categoryId, YearMonth month) {
        return transactionRepository.sumByCategoryId(categoryId, TransactionType.EXPENSE, month.atDay(1),
                month.atEndOfMonth());
    }

    private static BudgetResponse toResponse(Budget budget, YearMonth month, BigDecimal spent) {
        Category category = budget.getCategory();
        BigDecimal limit = budget.getMonthlyLimit();
        BudgetStatus status = spent.compareTo(limit) > 0 ? BudgetStatus.EXCEEDED
                : spent.compareTo(limit.multiply(WARNING_RATIO)) >= 0 ? BudgetStatus.WARNING
                : BudgetStatus.OK;
        return new BudgetResponse(category.getId(), category.getName(), category.getColor(), category.getIcon(),
                month.toString(), limit, spent, percent(spent, limit), status);
    }

    static int percent(BigDecimal spent, BigDecimal limit) {
        return spent.multiply(BigDecimal.valueOf(100)).divide(limit, 0, RoundingMode.FLOOR).intValue();
    }

    private YearMonth parseMonth(String month) {
        if (month == null || month.isBlank()) {
            return YearMonth.now(clock);
        }
        try {
            return YearMonth.parse(month);
        } catch (DateTimeParseException e) {
            throw new BadRequestException("month must use the format yyyy-MM");
        }
    }
}
