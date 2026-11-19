package com.saasfinanceiro.finexp.gamification;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

import com.saasfinanceiro.finexp.model.UserProgress;

/** regras do streak: a cada 7 dias seguidos ganha um freeze (max 2), cada freeze cobre um dia perdido */
public final class StreakTracker {

    public static final int MAX_FREEZES = 2;
    public static final int DAYS_PER_FREEZE = 7;

    private StreakTracker() {
    }

    /** registra atividade no dia; true se o streak aumentou */
    public static boolean registerActivity(UserProgress progress, LocalDate day) {
        LocalDate last = progress.getLastActiveDate();
        if (last != null && !day.isAfter(last)) {
            return false;
        }

        if (last == null) {
            start(progress, day);
        } else {
            long missedDays = ChronoUnit.DAYS.between(last, day) - 1;
            if (missedDays == 0) {
                progress.setCurrentStreak(progress.getCurrentStreak() + 1);
            } else if (missedDays <= progress.getFreezes()) {
                progress.setFreezes(progress.getFreezes() - (int) missedDays);
                progress.setCurrentStreak(progress.getCurrentStreak() + 1);
            } else {
                start(progress, day);
            }
        }

        progress.setLastActiveDate(day);
        progress.setBestStreak(Math.max(progress.getBestStreak(), progress.getCurrentStreak()));
        if (progress.getCurrentStreak() % DAYS_PER_FREEZE == 0) {
            progress.setFreezes(Math.min(MAX_FREEZES, progress.getFreezes() + 1));
        }
        return true;
    }

    /** streak de hoje: continua vivo se os freezes cobrem os dias perdidos, senão zera */
    public static int currentStreak(UserProgress progress, LocalDate today) {
        LocalDate last = progress.getLastActiveDate();
        if (last == null) {
            return 0;
        }
        long missedDays = ChronoUnit.DAYS.between(last, today) - 1;
        return missedDays <= progress.getFreezes() ? progress.getCurrentStreak() : 0;
    }

    private static void start(UserProgress progress, LocalDate day) {
        progress.setCurrentStreak(1);
        progress.setStreakStartDate(day);
    }
}
