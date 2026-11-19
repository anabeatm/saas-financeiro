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

/** stream em tempo real (sse): o usuário recebe um evento quando alguma carteira dele muda */
@RestController
@RequestMapping("/api/v1/events")
public class EventStreamController {

    private final SseConnectionRegistry registry;

    public EventStreamController(SseConnectionRegistry registry) {
        this.registry = registry;
    }

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream(@AuthenticationPrincipal User user, HttpServletResponse response) {
        // proxy não pode fazer cache/buffer, senão os eventos chegam atrasados
        response.setHeader("Cache-Control", "no-cache");
        response.setHeader("X-Accel-Buffering", "no");
        return registry.register(user.getId());
    }
}
