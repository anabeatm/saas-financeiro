package com.saasfinanceiro.finexp.security;

import java.time.Clock;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Fixed-window request counter, kept in memory: at most {@code limit} hits per key in each window.
 * Enough for a single API instance; with several instances the counters would have to move to a
 * shared store (e.g. Redis).
 */
public class RateLimiter {

    /** Whether the hit was allowed and, if not, in how many seconds the window resets. */
    public record Decision(boolean allowed, long retryAfterSeconds) {}

    private record Window(long startMillis, long durationMillis, int count) {
        boolean expired(long now) {
            return now - startMillis >= durationMillis;
        }
    }

    private final Map<String, Window> windows = new ConcurrentHashMap<>();
    private final Clock clock;

    public RateLimiter(Clock clock) {
        this.clock = clock;
    }

    public Decision tryAcquire(String key, int limit, Duration window) {
        long now = clock.millis();
        Window updated = windows.compute(key, (k, current) -> {
            if (current == null || current.expired(now)) {
                return new Window(now, window.toMillis(), 1);
            }
            return new Window(current.startMillis(), current.durationMillis(), current.count() + 1);
        });

        if (updated.count() <= limit) {
            return new Decision(true, 0);
        }
        long remainingMillis = updated.startMillis() + updated.durationMillis() - now;
        return new Decision(false, Math.max(1, (remainingMillis + 999) / 1000));
    }

    /** Drops expired windows so the map does not grow forever. */
    public void evictExpired() {
        long now = clock.millis();
        windows.values().removeIf(w -> w.expired(now));
    }

    int size() {
        return windows.size();
    }
}
