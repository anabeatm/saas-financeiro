package com.saasfinanceiro.finexp.security;

import java.time.Clock;
import java.time.Duration;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.saasfinanceiro.finexp.exceptions.TooManyRequestsException;

/** bloqueia o email por um tempo depois de muitas senhas erradas */
@Service
public class LoginAttemptService {

    private static final Logger log = LoggerFactory.getLogger(LoginAttemptService.class);

    static final int MAX_FAILURES = 5;
    static final Duration LOCK_WINDOW = Duration.ofMinutes(15);

    private record Failures(long firstAtMillis, int count) {}

    private final Map<String, Failures> failures = new ConcurrentHashMap<>();
    private final Clock clock;

    public LoginAttemptService() {
        this(Clock.systemUTC());
    }

    LoginAttemptService(Clock clock) {
        this.clock = clock;
    }

    /** 429 se a conta tá bloqueada */
    public void checkNotBlocked(String email) {
        Failures current = active(key(email));
        if (current != null && current.count() >= MAX_FAILURES) {
            long remaining = current.firstAtMillis() + LOCK_WINDOW.toMillis() - clock.millis();
            long seconds = Math.max(1, (remaining + 999) / 1000);
            throw new TooManyRequestsException(
                    "Too many failed login attempts. Please try again in " + RateLimitFilter.describe(seconds) + ".",
                    seconds);
        }
    }

    public void recordFailure(String email) {
        String key = key(email);
        long now = clock.millis();
        Failures updated = failures.compute(key, (k, current) -> current == null || expired(current, now)
                ? new Failures(now, 1)
                : new Failures(current.firstAtMillis(), current.count() + 1));
        if (updated.count() == MAX_FAILURES) {
            log.warn("Login temporarily blocked after {} failed attempts for {}", MAX_FAILURES, mask(key));
        }
    }

    public void recordSuccess(String email) {
        failures.remove(key(email));
    }

    @Scheduled(fixedRate = 300_000)
    public void evictExpired() {
        long now = clock.millis();
        failures.values().removeIf(f -> expired(f, now));
    }

    private Failures active(String key) {
        Failures current = failures.get(key);
        return current == null || expired(current, clock.millis()) ? null : current;
    }

    private static boolean expired(Failures f, long now) {
        return now - f.firstAtMillis() >= LOCK_WINDOW.toMillis();
    }

    private static String key(String email) {
        return email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
    }

    /** esconde parte do email nos logs */
    static String mask(String email) {
        int at = email.indexOf('@');
        return at <= 0 ? "***" : email.charAt(0) + "***" + email.substring(at);
    }
}
