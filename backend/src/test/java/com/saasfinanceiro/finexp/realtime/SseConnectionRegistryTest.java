package com.saasfinanceiro.finexp.realtime;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotSame;

import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

class SseConnectionRegistryTest {

    private final SseConnectionRegistry registry = new SseConnectionRegistry();

    @Test
    void keepsOneConnectionPerTabOfTheSameUser() {
        SseEmitter first = registry.register(1L);
        SseEmitter second = registry.register(1L);

        assertNotSame(first, second);
        assertEquals(2, registry.connectionCount(1L));
        assertEquals(0, registry.connectionCount(2L));
    }

    @Test
    void limitsTheConnectionsOfOneUser() {
        for (int i = 0; i < SseConnectionRegistry.MAX_CONNECTIONS_PER_USER + 3; i++) {
            registry.register(1L);
        }

        assertEquals(SseConnectionRegistry.MAX_CONNECTIONS_PER_USER, registry.connectionCount(1L));
    }

    @Test
    void sendingToUsersWithoutConnectionsIsANoOp() {
        registry.register(1L);
        WalletEvent event = new WalletEvent(WalletEventType.WALLET_UPDATED, 10L, "Household", 1L, "Ana",
                null, null, null, null, LocalDateTime.now());

        assertDoesNotThrow(() -> registry.send(List.of(1L, 99L), event));
        assertDoesNotThrow(registry::heartbeat);
        assertEquals(1, registry.connectionCount(1L));
    }
}
