package com.saasfinanceiro.finexp.realtime;

import java.io.IOException;
import java.time.Duration;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

/**
 * Open Server-Sent Events connections, per user. A user may have the app open in a few tabs or
 * devices; each one is a connection. Events are pushed only to the users given as recipients.
 */
@Component
public class SseConnectionRegistry {

    private static final Logger log = LoggerFactory.getLogger(SseConnectionRegistry.class);

    static final String EVENT_NAME = "wallet-event";
    public static final String GAMIFICATION_EVENT_NAME = "gamification-event";
    /** The browser reconnects after this; it also bounds how long a dead connection is kept. */
    static final long CONNECTION_TIMEOUT_MS = Duration.ofMinutes(30).toMillis();
    /** Caps the resources a single account can hold open (oldest connection is closed first). */
    static final int MAX_CONNECTIONS_PER_USER = 5;

    private final Map<Long, List<SseEmitter>> connections = new ConcurrentHashMap<>();

    public SseEmitter register(Long userId) {
        SseEmitter emitter = new SseEmitter(CONNECTION_TIMEOUT_MS);
        List<SseEmitter> userConnections = connections.computeIfAbsent(userId, id -> new CopyOnWriteArrayList<>());

        while (userConnections.size() >= MAX_CONNECTIONS_PER_USER) {
            SseEmitter oldest = userConnections.remove(0);
            oldest.complete();
        }
        userConnections.add(emitter);

        emitter.onCompletion(() -> remove(userId, emitter));
        emitter.onTimeout(() -> remove(userId, emitter));
        emitter.onError(error -> remove(userId, emitter));

        // First message, so the client knows the stream is open.
        sendTo(userId, emitter, SseEmitter.event().name("connected").data("ok"));
        return emitter;
    }

    public void send(Collection<Long> userIds, WalletEvent event) {
        for (Long userId : userIds) {
            for (SseEmitter emitter : connections.getOrDefault(userId, List.of())) {
                sendTo(userId, emitter, SseEmitter.event().name(EVENT_NAME).data(event, MediaType.APPLICATION_JSON));
            }
        }
    }

    /** Pushes an event to every open connection of a single user. */
    public void sendToUser(Long userId, String eventName, Object payload) {
        for (SseEmitter emitter : connections.getOrDefault(userId, List.of())) {
            sendTo(userId, emitter, SseEmitter.event().name(eventName).data(payload, MediaType.APPLICATION_JSON));
        }
    }

    /**
     * A comment line every 25 s keeps idle connections open behind proxies (Render, for example,
     * closes connections with no traffic) and detects clients that went away.
     */
    @Scheduled(fixedRate = 25_000)
    public void heartbeat() {
        connections.forEach((userId, userConnections) -> userConnections
                .forEach(emitter -> sendTo(userId, emitter, SseEmitter.event().comment("ping"))));
    }

    int connectionCount(Long userId) {
        return connections.getOrDefault(userId, List.of()).size();
    }

    private void sendTo(Long userId, SseEmitter emitter, SseEmitter.SseEventBuilder message) {
        try {
            emitter.send(message);
        } catch (IOException | IllegalStateException e) {
            // Client disconnected or connection already completed.
            log.debug("Dropping SSE connection of user {}: {}", userId, e.getMessage());
            remove(userId, emitter);
        }
    }

    private void remove(Long userId, SseEmitter emitter) {
        connections.computeIfPresent(userId, (id, userConnections) -> {
            userConnections.remove(emitter);
            return userConnections.isEmpty() ? null : userConnections;
        });
    }
}
