package com.saasfinanceiro.finexp.dto.gamification;

import java.time.Instant;

import com.saasfinanceiro.finexp.model.enums.AchievementCode;

/** An achievement and whether the user has it ({@code unlockedAt} is null while locked). */
public record AchievementResponse(
    AchievementCode code,
    String title,
    String description,
    boolean unlocked,
    Instant unlockedAt
) {}
