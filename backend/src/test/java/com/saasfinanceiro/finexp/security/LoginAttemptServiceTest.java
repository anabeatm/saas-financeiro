package com.saasfinanceiro.finexp.security;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.concurrent.atomic.AtomicLong;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.saasfinanceiro.finexp.exceptions.TooManyRequestsException;

class LoginAttemptServiceTest {

    private final AtomicLong now = new AtomicLong(5_000_000);
    private LoginAttemptService service;

    @BeforeEach
    void setUp() {
        service = new LoginAttemptService(new Clock() {
            @Override
            public ZoneOffset getZone() {
                return ZoneOffset.UTC;
            }

            @Override
            public Clock withZone(ZoneId zone) {
                return this;
            }

            @Override
            public Instant instant() {
                return Instant.ofEpochMilli(now.get());
            }
        });
    }

    @Test
    void blocksTheAccountAfterFiveWrongPasswords() {
        for (int i = 0; i < LoginAttemptService.MAX_FAILURES - 1; i++) {
            service.recordFailure("ana@example.com");
        }
        assertDoesNotThrow(() -> service.checkNotBlocked("ana@example.com"));

        service.recordFailure("ana@example.com");

        TooManyRequestsException blocked = assertThrows(TooManyRequestsException.class,
                () -> service.checkNotBlocked("ana@example.com"));
        assertEquals(900, blocked.getRetryAfterSeconds());
        assertTrue(blocked.getMessage().contains("15 minutes"));
    }

    @Test
    void theEmailIsComparedIgnoringCaseAndSpaces() {
        for (int i = 0; i < LoginAttemptService.MAX_FAILURES; i++) {
            service.recordFailure("Ana@Example.com ");
        }
        assertThrows(TooManyRequestsException.class, () -> service.checkNotBlocked("ana@example.com"));
    }

    @Test
    void unblocksWhenTheWindowEnds() {
        for (int i = 0; i < LoginAttemptService.MAX_FAILURES; i++) {
            service.recordFailure("ana@example.com");
        }
        now.addAndGet(LoginAttemptService.LOCK_WINDOW.toMillis());

        assertDoesNotThrow(() -> service.checkNotBlocked("ana@example.com"));
    }

    @Test
    void aSuccessfulLoginClearsTheFailures() {
        for (int i = 0; i < LoginAttemptService.MAX_FAILURES - 1; i++) {
            service.recordFailure("ana@example.com");
        }
        service.recordSuccess("ana@example.com");
        service.recordFailure("ana@example.com");

        assertDoesNotThrow(() -> service.checkNotBlocked("ana@example.com"));
    }

    @Test
    void otherAccountsAreNotAffected() {
        for (int i = 0; i < LoginAttemptService.MAX_FAILURES; i++) {
            service.recordFailure("ana@example.com");
        }
        assertDoesNotThrow(() -> service.checkNotBlocked("bia@example.com"));
    }

    @Test
    void masksEmailsInLogs() {
        assertEquals("a***@example.com", LoginAttemptService.mask("ana@example.com"));
        assertEquals("***", LoginAttemptService.mask("invalid"));
    }
}
