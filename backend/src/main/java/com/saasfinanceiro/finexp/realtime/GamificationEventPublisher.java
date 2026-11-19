package com.saasfinanceiro.finexp.realtime;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/**
 * Sends progress events (XP, level, achievements, budget alerts) to the user's open connections,
 * only after the database transaction commits, like the wallet events.
 */
@Component
public class GamificationEventPublisher {

    /** Application event carrying a {@link GamificationEvent} and its only recipient. */
    public record Message(Long userId, GamificationEvent event) {}

    private final ApplicationEventPublisher applicationEventPublisher;
    private final SseConnectionRegistry registry;

    public GamificationEventPublisher(ApplicationEventPublisher applicationEventPublisher,
            SseConnectionRegistry registry) {
        this.applicationEventPublisher = applicationEventPublisher;
        this.registry = registry;
    }

    public void publish(Long userId, GamificationEvent event) {
        applicationEventPublisher.publishEvent(new Message(userId, event));
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void onMessage(Message message) {
        registry.sendToUser(message.userId(), SseConnectionRegistry.GAMIFICATION_EVENT_NAME, message.event());
    }
}
