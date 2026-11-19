package com.saasfinanceiro.finexp.dto.gamification;

import java.time.Instant;

import com.saasfinanceiro.finexp.model.XpEvent;
import com.saasfinanceiro.finexp.model.enums.XpEventType;

public record XpEventResponse(
    XpEventType type,
    int xp,
    Instant createdAt
) {
    public XpEventResponse(XpEvent event) {
        this(event.getType(), event.getXp(), event.getCreatedAt());
    }
}
