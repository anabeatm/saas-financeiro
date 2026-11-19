package com.saasfinanceiro.finexp.realtime;

import java.time.Instant;

import com.saasfinanceiro.finexp.model.enums.AchievementCode;
import com.saasfinanceiro.finexp.model.enums.XpEventType;

/**
 * Real-time notification about the user's own progress (sent only to that user). Fields that do not
 * apply to the event type are null.
 */
public record GamificationEvent(
        GamificationEventType type,
        XpEventType xpReason,
        Integer xp,
        Integer level,
        String levelTitle,
        AchievementCode achievement,
        String achievementTitle,
        Long categoryId,
        String categoryName,
        Integer percent,
        Instant createdAt) {

    public static GamificationEvent xpGained(XpEventType reason, int xp, Instant now) {
        return new GamificationEvent(GamificationEventType.XP_GAINED, reason, xp, null, null, null, null, null,
                null, null, now);
    }

    public static GamificationEvent levelUp(int level, String title, Instant now) {
        return new GamificationEvent(GamificationEventType.LEVEL_UP, null, null, level, title, null, null, null,
                null, null, now);
    }

    public static GamificationEvent achievementUnlocked(AchievementCode code, Instant now) {
        return new GamificationEvent(GamificationEventType.ACHIEVEMENT_UNLOCKED, null, null, null, null, code,
                code.getTitle(), null, null, null, now);
    }

    public static GamificationEvent budget(GamificationEventType type, Long categoryId, String categoryName,
            int percent, Instant now) {
        return new GamificationEvent(type, null, null, null, null, null, null, categoryId, categoryName, percent,
                now);
    }
}
