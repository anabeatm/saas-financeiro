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

/** dados do streak do usuário */
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

    /** dia que o streak atual começou */
    private LocalDate streakStartDate;

    private LocalDate lastActiveDate;

    /** quantos dias perdidos o streak aguenta */
    @Column(nullable = false)
    private int freezes;

    /** último mês que já ganhou recompensa */
    private LocalDate lastClosedMonth;
}
