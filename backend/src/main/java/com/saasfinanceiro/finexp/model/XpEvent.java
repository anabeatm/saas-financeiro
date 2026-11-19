package com.saasfinanceiro.finexp.model;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import com.saasfinanceiro.finexp.model.enums.XpEventType;

import lombok.Data;

/**
 * One entry of a user's XP ledger. The total XP is the sum of the entries, so it never drifts, and
 * an award is undone by deleting its entry. {@code sourceKey} names what the XP was given for
 * (e.g. {@code TX:123}, {@code CHECKIN:2026-11-18}); being unique per user, the same thing can
 * never be rewarded twice.
 */
@Entity
@Data
@Table(uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "source_key"})
})
public class XpEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private XpEventType type;

    @Column(name = "source_key", nullable = false, length = 100)
    private String sourceKey;

    @Column(nullable = false)
    private int xp;

    @Column(nullable = false)
    private Instant createdAt;
}
