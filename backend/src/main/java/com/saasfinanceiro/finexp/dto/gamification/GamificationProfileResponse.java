package com.saasfinanceiro.finexp.dto.gamification;

import java.util.List;

/** progresso do usuário; levelStartXp/nextLevelXp são usados na barra de xp */
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
