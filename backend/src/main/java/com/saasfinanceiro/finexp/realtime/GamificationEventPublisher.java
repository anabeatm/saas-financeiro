package com.saasfinanceiro.finexp.realtime;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/** manda eventos de progresso (xp, nível, conquistas, orçamentos) depois do commit */
@Component
public class GamificationEventPublisher {

    /** evento + quem recebe */
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
