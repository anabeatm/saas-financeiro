package com.saasfinanceiro.finexp.gamification;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import com.saasfinanceiro.finexp.exceptions.ConflictException;
import com.saasfinanceiro.finexp.model.Budget;
import com.saasfinanceiro.finexp.model.Category;
import com.saasfinanceiro.finexp.model.User;
import com.saasfinanceiro.finexp.model.UserAchievement;
import com.saasfinanceiro.finexp.model.UserProgress;
import com.saasfinanceiro.finexp.model.XpEvent;
import com.saasfinanceiro.finexp.model.enums.AchievementCode;
import com.saasfinanceiro.finexp.model.enums.TransactionType;
import com.saasfinanceiro.finexp.model.enums.XpEventType;
import com.saasfinanceiro.finexp.realtime.GamificationEvent;
import com.saasfinanceiro.finexp.realtime.GamificationEventPublisher;
import com.saasfinanceiro.finexp.realtime.GamificationEventType;
import com.saasfinanceiro.finexp.repository.BudgetRepository;
import com.saasfinanceiro.finexp.repository.TransactionRepository;
import com.saasfinanceiro.finexp.repository.UserAchievementRepository;
import com.saasfinanceiro.finexp.repository.UserProgressRepository;
import com.saasfinanceiro.finexp.repository.UserRepository;
import com.saasfinanceiro.finexp.repository.XpEventRepository;

class GamificationServiceTest {

    private static final ZoneId ZONE = ZoneId.of("America/Sao_Paulo");
    /** Noon of 18 Nov 2026 in São Paulo. */
    private static final Instant NOW = Instant.parse("2026-11-18T15:00:00Z");
    private static final LocalDate TODAY = LocalDate.of(2026, 11, 18);

    private XpEventRepository xpEventRepository;
    private UserProgressRepository progressRepository;
    private UserAchievementRepository achievementRepository;
    private BudgetRepository budgetRepository;
    private TransactionRepository transactionRepository;
    private GamificationEventPublisher publisher;
    private GamificationService service;

    private User user;
    private UserProgress progress;

    @BeforeEach
    void setUp() {
        xpEventRepository = mock(XpEventRepository.class);
        progressRepository = mock(UserProgressRepository.class);
        achievementRepository = mock(UserAchievementRepository.class);
        budgetRepository = mock(BudgetRepository.class);
        transactionRepository = mock(TransactionRepository.class);
        UserRepository userRepository = mock(UserRepository.class);
        publisher = mock(GamificationEventPublisher.class);
        service = new GamificationService(xpEventRepository, progressRepository, achievementRepository,
                budgetRepository, transactionRepository, userRepository, publisher, Clock.fixed(NOW, ZONE));

        user = new User();
        user.setId(7L);
        user.setCreatedAt(LocalDateTime.of(2026, 9, 1, 10, 0));

        progress = new UserProgress();
        progress.setUser(user);
        progress.setLastClosedMonth(LocalDate.of(2026, 10, 1));

        when(userRepository.findById(7L)).thenReturn(Optional.of(user));
        when(progressRepository.findByUserId(7L)).thenReturn(Optional.of(progress));
        when(progressRepository.save(any())).thenAnswer(i -> i.getArgument(0));
    }

    // ------------------------------------------------------------ transactions

    @Test
    void recentTransactionGivesXpStartsTheStreakAndUnlocksFirstStep() {
        service.onTransactionCreated(created(10L, TODAY));

        XpEvent xp = savedXpEvents().get(0);
        assertEquals("TX:10", xp.getSourceKey());
        assertEquals(GamificationService.TRANSACTION_XP, xp.getXp());
        assertEquals(1, progress.getCurrentStreak());
        verify(achievementRepository).save(argThat(a -> a.getCode() == AchievementCode.FIRST_STEP));
    }

    @Test
    void backdatedTransactionGivesNoXpButStillCountsAsActivity() {
        service.onTransactionCreated(created(10L, TODAY.minusDays(GamificationService.RECENT_DAYS + 1)));

        verify(xpEventRepository, never()).save(any());
        assertEquals(1, progress.getCurrentStreak());
    }

    @Test
    void transactionXpStopsAtTheDailyLimit() {
        when(xpEventRepository.countByUserIdAndTypeAndCreatedAtGreaterThanEqual(eq(7L), eq(XpEventType.TRANSACTION),
                any())).thenReturn((long) GamificationService.DAILY_TRANSACTION_XP_LIMIT);

        service.onTransactionCreated(created(10L, TODAY));

        verify(xpEventRepository, never()).save(any());
    }

    @Test
    void theSameSourceIsNeverRewardedTwice() {
        when(xpEventRepository.existsByUserIdAndSourceKey(7L, "TX:10")).thenReturn(true);

        service.onTransactionCreated(created(10L, TODAY));

        verify(xpEventRepository, never()).save(any());
    }

    @Test
    void crossingALevelThresholdAnnouncesTheNewLevel() {
        when(xpEventRepository.sumXpByUserId(7L)).thenReturn(98L);

        service.onTransactionCreated(created(10L, TODAY));

        ArgumentCaptor<GamificationEvent> events = ArgumentCaptor.forClass(GamificationEvent.class);
        verify(publisher, times(3)).publish(eq(7L), events.capture());
        GamificationEvent levelUp = events.getAllValues().stream()
                .filter(e -> e.type() == GamificationEventType.LEVEL_UP).findFirst().orElseThrow();
        assertEquals(2, levelUp.level());
    }

    @Test
    void deletingATransactionWithinADayTakesItsXpBack() {
        XpEvent xp = xpEvent("TX:10", NOW.minusSeconds(3600));
        when(xpEventRepository.findByUserIdAndSourceKey(7L, "TX:10")).thenReturn(Optional.of(xp));

        service.onTransactionDeleted(new TransactionActivity.Deleted(10L, 7L));

        verify(xpEventRepository).delete(xp);
    }

    @Test
    void deletingAnOlderTransactionKeepsItsXp() {
        XpEvent xp = xpEvent("TX:10", NOW.minusSeconds(2 * 24 * 3600));
        when(xpEventRepository.findByUserIdAndSourceKey(7L, "TX:10")).thenReturn(Optional.of(xp));

        service.onTransactionDeleted(new TransactionActivity.Deleted(10L, 7L));

        verify(xpEventRepository, never()).delete(any());
    }

    // ------------------------------------------------------------ check-in

    @Test
    void checkInIsRefusedOnADayWithExpenses() {
        when(transactionRepository.existsByCreatedByIdAndTypeAndCreatedAtGreaterThanEqual(eq(7L),
                eq(TransactionType.EXPENSE), any())).thenReturn(true);

        assertThrows(ConflictException.class, () -> service.checkIn(user));
        verify(xpEventRepository, never()).save(any());
    }

    @Test
    void checkInIsRefusedTwiceOnTheSameDay() {
        when(xpEventRepository.existsByUserIdAndSourceKey(7L, "CHECKIN:2026-11-18")).thenReturn(true);

        assertThrows(ConflictException.class, () -> service.checkIn(user));
    }

    @Test
    void fifthCheckInOfTheMonthUnlocksZeroDay() {
        when(xpEventRepository.countByUserIdAndTypeAndSourceKeyStartingWith(7L, XpEventType.CHECK_IN,
                "CHECKIN:2026-11-")).thenReturn(5L);

        service.checkIn(user);

        XpEvent xp = savedXpEvents().get(0);
        assertEquals("CHECKIN:2026-11-18", xp.getSourceKey());
        assertEquals(1, progress.getCurrentStreak());
        verify(achievementRepository).save(argThat(a -> a.getCode() == AchievementCode.ZERO_DAY));
    }

    // ------------------------------------------------------------ month closing

    @Test
    void endedMonthRewardsBudgetsMetAndSavings() {
        progress.setLastClosedMonth(LocalDate.of(2026, 9, 1)); // October still open
        Budget food = budget(2L, "500.00");
        Budget leisure = budget(3L, "100.00");
        when(budgetRepository.findAllByUserId(7L)).thenReturn(List.of(food, leisure));
        when(transactionRepository.sumByCategory(7L, TransactionType.EXPENSE, LocalDate.of(2026, 10, 1),
                LocalDate.of(2026, 10, 31))).thenReturn(List.of(categoryTotal(2L, "480.00"), categoryTotal(3L, "100.00")));
        when(transactionRepository.sumByTypeCreatedBy(7L, LocalDate.of(2026, 10, 1), LocalDate.of(2026, 10, 31)))
                .thenReturn(List.of(typeTotal(TransactionType.INCOME, "5000.00"),
                        typeTotal(TransactionType.EXPENSE, "3500.00")));

        service.getProfile(user);

        Map<String, Integer> xpByKey = savedXpEvents().stream()
                .collect(Collectors.toMap(XpEvent::getSourceKey, XpEvent::getXp));
        assertEquals(Map.of(
                "BUDGET:2:2026-10", GamificationService.BUDGET_MET_XP,
                "BUDGET:3:2026-10", GamificationService.BUDGET_MET_XP,
                // 30% saved: 100 + 6 x 10
                "MONTH:2026-10", 160), xpByKey);
        verify(achievementRepository).save(argThat(a -> a.getCode() == AchievementCode.ON_BUDGET));
        verify(achievementRepository).save(argThat(a -> a.getCode() == AchievementCode.SAVER_20));
        assertEquals(LocalDate.of(2026, 10, 1), progress.getLastClosedMonth());
    }

    @Test
    void aBudgetOverTheLimitBlocksOnPlan() {
        progress.setLastClosedMonth(LocalDate.of(2026, 9, 1));
        when(budgetRepository.findAllByUserId(7L)).thenReturn(List.of(budget(2L, "500.00")));
        when(transactionRepository.sumByCategory(eq(7L), eq(TransactionType.EXPENSE), any(), any()))
                .thenReturn(List.of(categoryTotal(2L, "500.01")));

        service.getProfile(user);

        verify(xpEventRepository, never()).save(any());
        verify(achievementRepository, never()).save(any());
    }

    @Test
    void closedMonthsAreNotEvaluatedAgain() {
        // October already closed; November is the current month.
        service.getProfile(user);

        verify(budgetRepository, never()).findAllByUserId(anyLong());
        verify(transactionRepository, never()).sumByTypeCreatedBy(anyLong(), any(), any());
    }

    @Test
    void newProgressNeverRewardsMonthsBeforeTheAccountExisted() {
        when(progressRepository.findByUserId(7L)).thenReturn(Optional.empty());

        service.getProfile(user);

        // Account created in September: September and October are closed, August is not.
        verify(transactionRepository).sumByTypeCreatedBy(7L, LocalDate.of(2026, 9, 1), LocalDate.of(2026, 9, 30));
        verify(transactionRepository).sumByTypeCreatedBy(7L, LocalDate.of(2026, 10, 1), LocalDate.of(2026, 10, 31));
        verify(transactionRepository, times(2)).sumByTypeCreatedBy(anyLong(), any(), any());
    }

    @Test
    void savingsBonusGivesTenXpPerFullFivePercentUpToOneHundred() {
        assertEquals(0, GamificationService.savingsBonus(new BigDecimal("0.0499")));
        assertEquals(10, GamificationService.savingsBonus(new BigDecimal("0.05")));
        assertEquals(60, GamificationService.savingsBonus(new BigDecimal("0.30")));
        assertEquals(100, GamificationService.savingsBonus(new BigDecimal("0.90")));
    }

    @Test
    void profileShowsLevelProgressAndAchievements() {
        when(xpEventRepository.sumXpByUserId(7L)).thenReturn(150L);
        UserAchievement first = new UserAchievement();
        first.setCode(AchievementCode.FIRST_STEP);
        first.setUnlockedAt(NOW);
        when(achievementRepository.findAllByUserId(7L)).thenReturn(List.of(first));
        progress.setLastActiveDate(TODAY.minusDays(1));
        progress.setCurrentStreak(4);

        var profile = service.getProfile(user);

        assertEquals(2, profile.level());
        assertEquals(100, profile.levelStartXp());
        assertEquals(300, profile.nextLevelXp());
        assertEquals(4, profile.currentStreak());
        assertEquals(AchievementCode.values().length, profile.achievements().size());
        assertTrue(profile.achievements().get(0).unlocked());
    }

    // ------------------------------------------------------------ helpers

    private static TransactionActivity.Created created(Long id, LocalDate date) {
        return new TransactionActivity.Created(id, 7L, TransactionType.EXPENSE, new BigDecimal("20.00"), date, null);
    }

    private List<XpEvent> savedXpEvents() {
        ArgumentCaptor<XpEvent> captor = ArgumentCaptor.forClass(XpEvent.class);
        verify(xpEventRepository, atLeastOnce()).save(captor.capture());
        return captor.getAllValues();
    }

    private XpEvent xpEvent(String key, Instant createdAt) {
        XpEvent event = new XpEvent();
        event.setUser(user);
        event.setSourceKey(key);
        event.setCreatedAt(createdAt);
        return event;
    }

    private static Budget budget(Long categoryId, String limit) {
        Category category = new Category();
        category.setId(categoryId);
        Budget budget = new Budget();
        budget.setCategory(category);
        budget.setMonthlyLimit(new BigDecimal(limit));
        budget.setCreatedAt(LocalDateTime.of(2026, 9, 15, 10, 0));
        return budget;
    }

    private static TransactionRepository.CategoryTotal categoryTotal(Long categoryId, String total) {
        return new TransactionRepository.CategoryTotal() {
            public Long getCategoryId() { return categoryId; }
            public BigDecimal getTotal() { return new BigDecimal(total); }
        };
    }

    private static TransactionRepository.TypeTotal typeTotal(TransactionType type, String total) {
        return new TransactionRepository.TypeTotal() {
            public TransactionType getType() { return type; }
            public BigDecimal getTotal() { return new BigDecimal(total); }
        };
    }
}
