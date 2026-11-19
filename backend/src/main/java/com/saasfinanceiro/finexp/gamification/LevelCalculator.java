package com.saasfinanceiro.finexp.gamification;

/**
 * Levels from total XP. Reaching level {@code n} takes {@code 50 * (n - 1) * n} XP in total, so
 * each level costs 100 XP more than the previous one: 0, 100, 300, 600, 1000...
 */
public final class LevelCalculator {

    static final int XP_STEP = 50;

    private LevelCalculator() {
    }

    /** Total XP needed to reach a level (level 1 needs none). */
    public static long xpForLevel(int level) {
        return (long) XP_STEP * (level - 1) * level;
    }

    public static int levelFor(long xp) {
        int level = 1;
        while (xpForLevel(level + 1) <= xp) {
            level++;
        }
        return level;
    }

    /** A new title every 5 levels. */
    public static String titleFor(int level) {
        if (level >= 20) return "Finance Master";
        if (level >= 15) return "Strategist";
        if (level >= 10) return "Saver";
        if (level >= 5) return "Organized";
        return "Beginner";
    }
}
