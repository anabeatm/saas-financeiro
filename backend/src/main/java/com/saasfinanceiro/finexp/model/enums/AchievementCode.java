package com.saasfinanceiro.finexp.model.enums;

/** conquistas que dá pra desbloquear */
public enum AchievementCode {
    FIRST_STEP("First Step", "Log your first transaction"),
    STREAK_7("Iron Week", "Stay active for 7 days in a row"),
    STREAK_30("Flawless Month", "Stay active for 30 days in a row"),
    ON_BUDGET("On Plan", "Close a month within all of your budgets"),
    SAVER_20("Saver", "Save at least 20% of your income in a month"),
    ZERO_DAY("Zero Day", "Check in 5 no-spending days in the same month");

    private final String title;
    private final String description;

    AchievementCode(String title, String description) {
        this.title = title;
        this.description = description;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }
}
