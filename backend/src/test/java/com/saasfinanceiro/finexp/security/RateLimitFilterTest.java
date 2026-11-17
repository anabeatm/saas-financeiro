package com.saasfinanceiro.finexp.security;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.concurrent.atomic.AtomicLong;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

class RateLimitFilterTest {

    private final AtomicLong now = new AtomicLong(1_000_000);
    private RateLimiter rateLimiter;
    private RateLimitFilter filter;

    @BeforeEach
    void setUp() {
        Clock clock = new Clock() {
            @Override
            public ZoneOffset getZone() {
                return ZoneOffset.UTC;
            }

            @Override
            public Clock withZone(java.time.ZoneId zone) {
                return this;
            }

            @Override
            public Instant instant() {
                return Instant.ofEpochMilli(now.get());
            }
        };
        rateLimiter = new RateLimiter(clock);
        filter = new RateLimitFilter(rateLimiter);
    }

    @Test
    void blocksAnIpAfterTheLoginLimitAndAllowsItAgainWhenTheWindowEnds() throws Exception {
        for (int i = 0; i < 10; i++) {
            assertEquals(200, post("/auth/login", "203.0.113.7").getStatus());
        }

        MockHttpServletResponse blocked = post("/auth/login", "203.0.113.7");
        assertEquals(429, blocked.getStatus());
        assertEquals("60", blocked.getHeader("Retry-After"));
        assertTrue(blocked.getContentAsString().contains("Too many attempts"));

        // other clients are not affected
        assertEquals(200, post("/auth/login", "198.51.100.20").getStatus());

        now.addAndGet(Duration.ofMinutes(1).toMillis());
        assertEquals(200, post("/auth/login", "203.0.113.7").getStatus());
    }

    @Test
    void eachEndpointHasItsOwnCounter() throws Exception {
        for (int i = 0; i < 5; i++) {
            assertEquals(200, post("/auth/forgot-password", "203.0.113.7").getStatus());
        }
        assertEquals(429, post("/auth/forgot-password", "203.0.113.7").getStatus());
        assertEquals(200, post("/auth/login", "203.0.113.7").getStatus());
    }

    @Test
    void ignoresOtherRoutesAndMethods() throws Exception {
        for (int i = 0; i < 50; i++) {
            assertEquals(200, post("/api/v1/wallets", "203.0.113.7").getStatus());
        }
        MockHttpServletRequest get = new MockHttpServletRequest("GET", "/auth/login");
        get.setServletPath("/auth/login");
        assertTrue(filter.shouldNotFilter(get));
    }

    @Test
    void usesTheAddressAddedByTheProxyNotOneTypedByTheClient() {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/auth/login");
        request.setRemoteAddr("10.0.0.5");
        request.addHeader("X-Forwarded-For", "1.2.3.4, 203.0.113.7");

        assertEquals("203.0.113.7", ClientIp.of(request));

        MockHttpServletRequest direct = new MockHttpServletRequest("POST", "/auth/login");
        direct.setRemoteAddr("198.51.100.20");
        assertEquals("198.51.100.20", ClientIp.of(direct));
    }

    @Test
    void expiredWindowsAreEvicted() throws Exception {
        post("/auth/login", "203.0.113.7");
        assertEquals(1, rateLimiter.size());

        now.addAndGet(Duration.ofMinutes(2).toMillis());
        rateLimiter.evictExpired();

        assertEquals(0, rateLimiter.size());
    }

    @Test
    void describesTheWaitingTime() {
        assertEquals("1 second", RateLimitFilter.describe(1));
        assertEquals("45 seconds", RateLimitFilter.describe(45));
        assertEquals("1 minute", RateLimitFilter.describe(60));
        assertEquals("15 minutes", RateLimitFilter.describe(890));
        assertFalse(RateLimitFilter.describe(3600).isBlank());
    }

    private MockHttpServletResponse post(String path, String ip) throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", path);
        request.setServletPath(path);
        request.setRemoteAddr(ip);
        MockHttpServletResponse response = new MockHttpServletResponse();
        filter.doFilter(request, response, new MockFilterChain());
        return response;
    }
}
