package com.saasfinanceiro.finexp.gamification;

/** nível a partir do xp total: nível n precisa de 50 * (n - 1) * n xp (0, 100, 300, 600...) */
public final class LevelCalculator {

    static final int XP_STEP = 50;

    private LevelCalculator() {
    }

    /** xp total pra chegar num nível */
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

    /** título novo a cada 5 níveis */
    public static String titleFor(int level) {
        if (level >= 20) return "Finance Master";
        if (level >= 15) return "Strategist";
        if (level >= 10) return "Saver";
        if (level >= 5) return "Organized";
        return "Beginner";
    }
}
