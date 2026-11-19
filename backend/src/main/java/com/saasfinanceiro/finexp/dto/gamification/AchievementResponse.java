package com.saasfinanceiro.finexp.dto.gamification;

import java.time.Instant;

import com.saasfinanceiro.finexp.model.enums.AchievementCode;

/** conquista; {@code unlockedAt} fica null enquanto tá bloqueada */
public record AchievementResponse(
    AchievementCode code,
    String title,
    String description,
    boolean unlocked,
    Instant unlockedAt
) {}
