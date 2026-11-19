package com.saasfinanceiro.finexp.gamification;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.saasfinanceiro.finexp.dto.gamification.AchievementResponse;
import com.saasfinanceiro.finexp.dto.gamification.GamificationProfileResponse;
import com.saasfinanceiro.finexp.dto.gamification.XpEventResponse;
import com.saasfinanceiro.finexp.exceptions.ConflictException;
import com.saasfinanceiro.finexp.model.Budget;
import com.saasfinanceiro.finexp.model.User;
import com.saasfinanceiro.finexp.model.UserAchievement;
import com.saasfinanceiro.finexp.model.UserProgress;
import com.saasfinanceiro.finexp.model.XpEvent;
import com.saasfinanceiro.finexp.model.enums.AchievementCode;
import com.saasfinanceiro.finexp.model.enums.TransactionType;
import com.saasfinanceiro.finexp.model.enums.XpEventType;
import com.saasfinanceiro.finexp.realtime.GamificationEvent;
import com.saasfinanceiro.finexp.realtime.GamificationEventPublisher;
import com.saasfinanceiro.finexp.repository.BudgetRepository;
import com.saasfinanceiro.finexp.repository.TransactionRepository;
import com.saasfinanceiro.finexp.repository.UserAchievementRepository;
import com.saasfinanceiro.finexp.repository.UserProgressRepository;
import com.saasfinanceiro.finexp.repository.UserRepository;
import com.saasfinanceiro.finexp.repository.XpEventRepository;

/** xp, níveis, streak e conquistas. o mês só fecha quando o usuário abre o progresso (o render free dorme, então não dá pra agendar) */
@Service
public class GamificationService {

    static final int TRANSACTION_XP = 5;
    static final int DAILY_TRANSACTION_XP_LIMIT = 10;
    /** transação mais antiga que isso não dá xp */
    static final int RECENT_DAYS = 3;
    /** apagou dentro desse prazo, perde o xp */
    static final Duration XP_REVERT_WINDOW = Duration.ofHours(24);
    static final int CHECK_IN_XP = 5;
    static final int STREAK_7_XP = 30;
    static final int STREAK_30_XP = 150;
    static final int BUDGET_MET_XP = 50;
    static final int POSITIVE_MONTH_XP = 100;
    static final int MAX_SAVINGS_BONUS_XP = 100;
    static final int ZERO_DAY_CHECK_INS = 5;
    static final BigDecimal SAVER_RATE = new BigDecimal("0.20");
    /** max de meses fechados de uma vez */
    static final int MAX_MONTHS_TO_CLOSE = 12;

    private final XpEventRepository xpEventRepository;
    private final UserProgressRepository progressRepository;
    private final UserAchievementRepository achievementRepository;
    private final BudgetRepository budgetRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final GamificationEventPublisher publisher;
    private final Clock clock;

    public GamificationService(XpEventRepository xpEventRepository, UserProgressRepository progressRepository,
            UserAchievementRepository achievementRepository, BudgetRepository budgetRepository,
            TransactionRepository transactionRepository, UserRepository userRepository,
            GamificationEventPublisher publisher, Clock clock) {
        this.xpEventRepository = xpEventRepository;
        this.progressRepository = progressRepository;
        this.achievementRepository = achievementRepository;
        this.budgetRepository = budgetRepository;
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
        this.publisher = publisher;
        this.clock = clock;
    }

    // ---------------------------------------------------------------- transactions

    /** roda depois do commit */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void onTransactionCreated(TransactionActivity.Created event) {
        User user = userRepository.findById(event.userId()).orElse(null);
        if (user == null) {
            return;
        }
        LocalDate today = LocalDate.now(clock);

        unlock(user, AchievementCode.FIRST_STEP);

        if (isRecent(event.date(), today) && transactionXpToday(user, today) < DAILY_TRANSACTION_XP_LIMIT) {
            award(user, XpEventType.TRANSACTION, "TX:" + event.transactionId(), TRANSACTION_XP);
        }

        registerActivity(user, progressFor(user), today);
    }

    /** tira o xp de uma transação criada há pouco tempo */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void onTransactionDeleted(TransactionActivity.Deleted event) {
        xpEventRepository.findByUserIdAndSourceKey(event.creatorId(), "TX:" + event.transactionId())
                .filter(xp -> xp.getCreatedAt().isAfter(Instant.now(clock).minus(XP_REVERT_WINDOW)))
                .ifPresent(xpEventRepository::delete);
    }

    // ---------------------------------------------------------------- check-in

    /** "não gastei nada hoje": mantém o streak */
    @Transactional
    public GamificationProfileResponse checkIn(User user) {
        LocalDate today = LocalDate.now(clock);

        if (xpEventRepository.existsByUserIdAndSourceKey(user.getId(), checkInKey(today))) {
            throw new ConflictException("You already checked in today");
        }
        if (transactionRepository.existsByCreatedByIdAndTypeAndCreatedAtGreaterThanEqual(user.getId(),
                TransactionType.EXPENSE, startOfDayInServerTime(today))) {
            throw new ConflictException("You logged an expense today, so it is not a no-spending day");
        }

        award(user, XpEventType.CHECK_IN, checkInKey(today), CHECK_IN_XP);
        registerActivity(user, progressFor(user), today);

        String monthPrefix = "CHECKIN:" + YearMonth.from(today) + "-";
        if (xpEventRepository.countByUserIdAndTypeAndSourceKeyStartingWith(user.getId(), XpEventType.CHECK_IN,
                monthPrefix) >= ZERO_DAY_CHECK_INS) {
            unlock(user, AchievementCode.ZERO_DAY);
        }

        return getProfile(user);
    }

    // ---------------------------------------------------------------- profile

    @Transactional
    public GamificationProfileResponse getProfile(User user) {
        UserProgress progress = progressFor(user);
        closePendingMonths(user, progress);

        LocalDate today = LocalDate.now(clock);
        long xp = xpEventRepository.sumXpByUserId(user.getId());
        int level = LevelCalculator.levelFor(xp);

        Map<AchievementCode, UserAchievement> unlocked = achievementRepository.findAllByUserId(user.getId())
                .stream().collect(Collectors.toMap(UserAchievement::getCode, Function.identity()));
        List<AchievementResponse> achievements = Arrays.stream(AchievementCode.values())
                .map(code -> {
                    UserAchievement a = unlocked.get(code);
                    return new AchievementResponse(code, code.getTitle(), code.getDescription(), a != null,
                            a != null ? a.getUnlockedAt() : null);
                })
                .toList();

        List<XpEventResponse> recentXp = xpEventRepository.findTop10ByUserIdOrderByCreatedAtDescIdDesc(user.getId())
                .stream().map(XpEventResponse::new).toList();

        return new GamificationProfileResponse(xp, level, LevelCalculator.titleFor(level),
                LevelCalculator.xpForLevel(level), LevelCalculator.xpForLevel(level + 1),
                StreakTracker.currentStreak(progress, today), progress.getBestStreak(), progress.getFreezes(),
                xpEventRepository.existsByUserIdAndSourceKey(user.getId(), checkInKey(today)),
                achievements, recentXp);
    }

    // ---------------------------------------------------------------- month closing

    /** dá a recompensa dos meses que fecharam desde a última vez */
    void closePendingMonths(User user, UserProgress progress) {
        YearMonth current = YearMonth.now(clock);
        YearMonth month = YearMonth.from(progress.getLastClosedMonth()).plusMonths(1);
        YearMonth oldest = current.minusMonths(MAX_MONTHS_TO_CLOSE);
        if (month.isBefore(oldest)) {
            month = oldest;
        }

        boolean closedAny = false;
        while (month.isBefore(current)) {
            closeMonth(user, month);
            progress.setLastClosedMonth(month.atDay(1));
            closedAny = true;
            month = month.plusMonths(1);
        }
        if (closedAny) {
            progressRepository.save(progress);
        }
    }

    private void closeMonth(User user, YearMonth month) {
        LocalDate start = month.atDay(1);
        LocalDate end = month.atEndOfMonth();

        // ignora orçamento criado depois do mês
        List<Budget> budgets = budgetRepository.findAllByUserId(user.getId()).stream()
                .filter(b -> b.getCreatedAt() == null || !YearMonth.from(b.getCreatedAt()).isAfter(month))
                .toList();
        if (!budgets.isEmpty()) {
            Map<Long, BigDecimal> spent = transactionRepository
                    .sumByCategory(user.getId(), TransactionType.EXPENSE, start, end).stream()
                    .collect(Collectors.toMap(TransactionRepository.CategoryTotal::getCategoryId,
                            TransactionRepository.CategoryTotal::getTotal));

            boolean allMet = true;
            for (Budget budget : budgets) {
                Long categoryId = budget.getCategory().getId();
                if (spent.getOrDefault(categoryId, BigDecimal.ZERO).compareTo(budget.getMonthlyLimit()) <= 0) {
                    award(user, XpEventType.BUDGET_MET, "BUDGET:" + categoryId + ":" + month, BUDGET_MET_XP);
                } else {
                    allMet = false;
                }
            }
            if (allMet) {
                unlock(user, AchievementCode.ON_BUDGET);
            }
        }

        BigDecimal income = BigDecimal.ZERO;
        BigDecimal expense = BigDecimal.ZERO;
        for (TransactionRepository.TypeTotal total : transactionRepository.sumByTypeCreatedBy(user.getId(), start, end)) {
            if (total.getType() == TransactionType.INCOME) {
                income = total.getTotal();
            } else {
                expense = total.getTotal();
            }
        }
        if (income.signum() > 0 && income.compareTo(expense) > 0) {
            BigDecimal savingsRate = income.subtract(expense).divide(income, 4, RoundingMode.FLOOR);
            award(user, XpEventType.MONTH_SAVINGS, "MONTH:" + month, POSITIVE_MONTH_XP + savingsBonus(savingsRate));
            if (savingsRate.compareTo(SAVER_RATE) >= 0) {
                unlock(user, AchievementCode.SAVER_20);
            }
        }
    }

    /** +10 xp a cada 5% da renda guardada (tem limite) */
    static int savingsBonus(BigDecimal savingsRate) {
        int steps = savingsRate.multiply(BigDecimal.valueOf(20)).setScale(0, RoundingMode.FLOOR).intValue();
        return Math.min(MAX_SAVINGS_BONUS_XP, steps * 10);
    }

    // ---------------------------------------------------------------- building blocks

    private void registerActivity(User user, UserProgress progress, LocalDate today) {
        if (!StreakTracker.registerActivity(progress, today)) {
            return;
        }
        progressRepository.save(progress);

        String streakId = String.valueOf(progress.getStreakStartDate());
        if (progress.getCurrentStreak() == 7) {
            award(user, XpEventType.STREAK_BONUS, "STREAK7:" + streakId, STREAK_7_XP);
            unlock(user, AchievementCode.STREAK_7);
        } else if (progress.getCurrentStreak() == 30) {
            award(user, XpEventType.STREAK_BONUS, "STREAK30:" + streakId, STREAK_30_XP);
            unlock(user, AchievementCode.STREAK_30);
        }
    }

    /** dá o xp uma vez só por sourceKey e avisa do xp/level up */
    private boolean award(User user, XpEventType type, String sourceKey, int xp) {
        if (xpEventRepository.existsByUserIdAndSourceKey(user.getId(), sourceKey)) {
            return false;
        }
        long before = xpEventRepository.sumXpByUserId(user.getId());
        Instant now = Instant.now(clock);

        XpEvent event = new XpEvent();
        event.setUser(user);
        event.setType(type);
        event.setSourceKey(sourceKey);
        event.setXp(xp);
        event.setCreatedAt(now);
        xpEventRepository.save(event);

        publisher.publish(user.getId(), GamificationEvent.xpGained(type, xp, now));
        int newLevel = LevelCalculator.levelFor(before + xp);
        if (newLevel > LevelCalculator.levelFor(before)) {
            publisher.publish(user.getId(),
                    GamificationEvent.levelUp(newLevel, LevelCalculator.titleFor(newLevel), now));
        }
        return true;
    }

    private void unlock(User user, AchievementCode code) {
        if (achievementRepository.existsByUserIdAndCode(user.getId(), code)) {
            return;
        }
        Instant now = Instant.now(clock);
        UserAchievement achievement = new UserAchievement();
        achievement.setUser(user);
        achievement.setCode(code);
        achievement.setUnlockedAt(now);
        achievementRepository.save(achievement);

        publisher.publish(user.getId(), GamificationEvent.achievementUnlocked(code, now));
    }

    private UserProgress progressFor(User user) {
        return progressRepository.findByUserId(user.getId()).orElseGet(() -> {
            UserProgress progress = new UserProgress();
            progress.setUser(user);
            // pula os meses antes da conta existir
            YearMonth firstMonth = user.getCreatedAt() != null ? YearMonth.from(user.getCreatedAt())
                    : YearMonth.now(clock);
            progress.setLastClosedMonth(firstMonth.minusMonths(1).atDay(1));
            return progressRepository.save(progress);
        });
    }

    private long transactionXpToday(User user, LocalDate today) {
        Instant startOfDay = today.atStartOfDay(clock.getZone()).toInstant();
        return xpEventRepository.countByUserIdAndTypeAndCreatedAtGreaterThanEqual(user.getId(),
                XpEventType.TRANSACTION, startOfDay);
    }

    private static boolean isRecent(LocalDate date, LocalDate today) {
        long age = ChronoUnit.DAYS.between(date, today);
        return age >= 0 && age <= RECENT_DAYS;
    }

    /** createdAt tá no fuso do servidor */
    private LocalDateTime startOfDayInServerTime(LocalDate day) {
        return day.atStartOfDay(clock.getZone()).withZoneSameInstant(ZoneId.systemDefault()).toLocalDateTime();
    }

    private static String checkInKey(LocalDate day) {
        return "CHECKIN:" + day;
    }
}
