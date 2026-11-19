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

/** registro de xp. o {@code sourceKey} (ex: TX:123) é único, então nada é recompensado duas vezes */
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
