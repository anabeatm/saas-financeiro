package com.saasfinanceiro.finexp.controller;

import jakarta.servlet.http.HttpServletResponse;

import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.saasfinanceiro.finexp.model.User;
import com.saasfinanceiro.finexp.realtime.SseConnectionRegistry;

/**
 * Real-time updates (Server-Sent Events). The authenticated user receives an event whenever a
 * wallet they belong to changes: transactions, wallet data or members.
 */
@RestController
@RequestMapping("/api/v1/events")
public class EventStreamController {

    private final SseConnectionRegistry registry;

    public EventStreamController(SseConnectionRegistry registry) {
        this.registry = registry;
    }

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream(@AuthenticationPrincipal User user, HttpServletResponse response) {
        // Proxies must not cache or buffer the stream, or events would arrive late.
        response.setHeader("Cache-Control", "no-cache");
        response.setHeader("X-Accel-Buffering", "no");
        return registry.register(user.getId());
    }
}
