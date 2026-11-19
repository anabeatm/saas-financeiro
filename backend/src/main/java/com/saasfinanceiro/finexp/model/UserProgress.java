package com.saasfinanceiro.finexp.model;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;

import lombok.Data;

/** Gamification state of a user that is not derived from the XP ledger: the activity streak. */
@Entity
@Data
public class UserProgress {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false)
    private int currentStreak;

    @Column(nullable = false)
    private int bestStreak;

    /** Day the current streak started; makes streak bonuses unique per streak. */
    private LocalDate streakStartDate;

    private LocalDate lastActiveDate;

    /** Missed days the streak can survive. */
    @Column(nullable = false)
    private int freezes;

    /** First day of the last month whose budgets and savings were already rewarded. */
    private LocalDate lastClosedMonth;
}
