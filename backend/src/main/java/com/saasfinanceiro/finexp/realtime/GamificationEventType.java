package com.saasfinanceiro.finexp.realtime;

/** What happened to the user's progress. Sent to the browser as the event's {@code type}. */
public enum GamificationEventType {
    XP_GAINED,
    LEVEL_UP,
    ACHIEVEMENT_UNLOCKED,
    BUDGET_WARNING,
    BUDGET_EXCEEDED
}
