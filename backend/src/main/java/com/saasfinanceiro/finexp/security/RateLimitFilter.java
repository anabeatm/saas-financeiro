package com.saasfinanceiro.finexp.security;

import java.io.IOException;
import java.time.Clock;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Map;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/** limite de requests por ip nos endpoints de auth (429 + Retry-After) */
@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(RateLimitFilter.class);

    record Rule(int limit, Duration window) {}

    /** endpoint → max de requests por ip */
    static final Map<String, Rule> RULES = Map.of(
            "/auth/login", new Rule(10, Duration.ofMinutes(1)),
            "/auth/register", new Rule(5, Duration.ofHours(1)),
            "/auth/forgot-password", new Rule(5, Duration.ofMinutes(15)),
            "/auth/reset-password", new Rule(10, Duration.ofMinutes(15)),
            "/auth/verify-account", new Rule(20, Duration.ofMinutes(15)));

    private final RateLimiter rateLimiter;

    public RateLimitFilter() {
        this(new RateLimiter(Clock.systemUTC()));
    }

    RateLimitFilter(RateLimiter rateLimiter) {
        this.rateLimiter = rateLimiter;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !"POST".equals(request.getMethod()) || !RULES.containsKey(request.getServletPath());
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String path = request.getServletPath();
        Rule rule = RULES.get(path);
        String ip = ClientIp.of(request);

        RateLimiter.Decision decision = rateLimiter.tryAcquire(path + "|" + ip, rule.limit(), rule.window());
        if (decision.allowed()) {
            chain.doFilter(request, response);
            return;
        }

        log.warn("Rate limit exceeded on {} by {}", path, ip);
        response.setStatus(429);
        response.setHeader(HttpHeaders.RETRY_AFTER, String.valueOf(decision.retryAfterSeconds()));
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write(String.format(
                "{\"timestamp\":\"%s\",\"status\":429,\"error\":\"Too Many Requests\","
                        + "\"message\":\"Too many attempts. Please try again in %s.\"}",
                LocalDateTime.now(), describe(decision.retryAfterSeconds())));
    }

    @Scheduled(fixedRate = 300_000)
    public void evictExpiredWindows() {
        rateLimiter.evictExpired();
    }

    static String describe(long seconds) {
        if (seconds < 60) {
            return seconds + (seconds == 1 ? " second" : " seconds");
        }
        long minutes = (seconds + 59) / 60;
        return minutes + (minutes == 1 ? " minute" : " minutes");
    }
}
