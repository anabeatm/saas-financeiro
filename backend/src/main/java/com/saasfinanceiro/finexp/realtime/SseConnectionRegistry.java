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

/** conexões sse abertas por usuário (uma por aba/dispositivo) */
@Component
public class SseConnectionRegistry {

    private static final Logger log = LoggerFactory.getLogger(SseConnectionRegistry.class);

    static final String EVENT_NAME = "wallet-event";
    public static final String GAMIFICATION_EVENT_NAME = "gamification-event";
    /** timeout da conexão */
    static final long CONNECTION_TIMEOUT_MS = Duration.ofMinutes(30).toMillis();
    /** max de conexões por usuário (fecha a mais velha primeiro) */
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

        // primeira msg, pro cliente saber que abriu
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

    /** manda o evento pra todas as conexões do usuário */
    public void sendToUser(Long userId, String eventName, Object payload) {
        for (SseEmitter emitter : connections.getOrDefault(userId, List.of())) {
            sendTo(userId, emitter, SseEmitter.event().name(eventName).data(payload, MediaType.APPLICATION_JSON));
        }
    }

    /** heartbeat a cada 25s pro proxy não derrubar a conexão */
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
            // cliente desconectou
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
