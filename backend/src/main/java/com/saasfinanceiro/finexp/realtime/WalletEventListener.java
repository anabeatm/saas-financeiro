package com.saasfinanceiro.finexp.realtime;

import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/**
 * Pushes wallet events to the connected browsers. Runs after the commit, so nobody is told about a
 * change that was rolled back; {@code fallbackExecution} also covers service methods that do not
 * run inside a transaction.
 */
@Component
public class WalletEventListener {

    private final SseConnectionRegistry registry;

    public WalletEventListener(SseConnectionRegistry registry) {
        this.registry = registry;
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void onWalletEvent(WalletEventMessage message) {
        registry.send(message.recipientIds(), message.event());
    }
}
