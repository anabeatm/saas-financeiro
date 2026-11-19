package com.saasfinanceiro.finexp.gamification;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.LocalDate;

import org.junit.jupiter.api.Test;

import com.saasfinanceiro.finexp.model.UserProgress;

class StreakTrackerTest {

    private static final LocalDate DAY = LocalDate.of(2026, 11, 2);

    private final UserProgress progress = new UserProgress();

    @Test
    void firstActivityStartsTheStreak() {
        assertTrue(StreakTracker.registerActivity(progress, DAY));

        assertEquals(1, progress.getCurrentStreak());
        assertEquals(1, progress.getBestStreak());
        assertEquals(DAY, progress.getStreakStartDate());
    }

    @Test
    void secondActivityOnTheSameDayIsIgnored() {
        StreakTracker.registerActivity(progress, DAY);

        assertFalse(StreakTracker.registerActivity(progress, DAY));
        assertEquals(1, progress.getCurrentStreak());
    }

    @Test
    void consecutiveDaysGrowTheStreak() {
        activeFor(3);

        assertEquals(3, progress.getCurrentStreak());
        assertEquals(DAY, progress.getStreakStartDate());
    }

    @Test
    void missingADayWithoutFreezesRestartsTheStreak() {
        activeFor(3);

        StreakTracker.registerActivity(progress, DAY.plusDays(4));

        assertEquals(1, progress.getCurrentStreak());
        assertEquals(3, progress.getBestStreak());
        assertEquals(DAY.plusDays(4), progress.getStreakStartDate());
    }

    @Test
    void sevenDaysInARowEarnAFreezeThatCoversAMissedDay() {
        activeFor(7);
        assertEquals(1, progress.getFreezes());

        // perdeu o dia 8, voltou no 9
        StreakTracker.registerActivity(progress, DAY.plusDays(8));

        assertEquals(8, progress.getCurrentStreak());
        assertEquals(0, progress.getFreezes());
        assertEquals(DAY, progress.getStreakStartDate());
    }

    @Test
    void freezesAreCappedAtTwo() {
        activeFor(28);

        assertEquals(StreakTracker.MAX_FREEZES, progress.getFreezes());
    }

    @Test
    void currentStreakDropsToZeroOnlyWhenFreezesCannotCoverTheGap() {
        activeFor(7); // 1 freeze
        LocalDate lastDay = DAY.plusDays(6);

        assertEquals(7, StreakTracker.currentStreak(progress, lastDay));
        assertEquals(7, StreakTracker.currentStreak(progress, lastDay.plusDays(1)));
        assertEquals(7, StreakTracker.currentStreak(progress, lastDay.plusDays(2)));
        assertEquals(0, StreakTracker.currentStreak(progress, lastDay.plusDays(3)));
    }

    @Test
    void noActivityMeansNoStreak() {
        assertEquals(0, StreakTracker.currentStreak(progress, DAY));
    }

    private void activeFor(int days) {
        for (int i = 0; i < days; i++) {
            StreakTracker.registerActivity(progress, DAY.plusDays(i));
        }
    }
}
