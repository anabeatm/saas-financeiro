package com.saasfinanceiro.finexp.dto.gamification;

import java.util.List;

/**
 * The user's progress. {@code levelStartXp} and {@code nextLevelXp} are the total XP at which the
 * current and the next level start, for the progress bar.
 */
public record GamificationProfileResponse(
    long xp,
    int level,
    String levelTitle,
    long levelStartXp,
    long nextLevelXp,
    int currentStreak,
    int bestStreak,
    int freezes,
    boolean checkedInToday,
    List<AchievementResponse> achievements,
    List<XpEventResponse> recentXp
) {}
