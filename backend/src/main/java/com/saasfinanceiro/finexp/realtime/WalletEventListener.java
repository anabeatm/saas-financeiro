package com.saasfinanceiro.finexp.realtime;

import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/** manda os eventos da carteira pro navegador depois do commit (se der rollback ninguém fica sabendo) */
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
