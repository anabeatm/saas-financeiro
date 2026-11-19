package com.saasfinanceiro.finexp.gamification;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/** atualiza xp e orçamentos depois que a transação salva; se der erro só loga, nunca quebra o save */
@Component
public class TransactionActivityListener {

    private static final Logger log = LoggerFactory.getLogger(TransactionActivityListener.class);

    private final GamificationService gamificationService;
    private final BudgetService budgetService;

    public TransactionActivityListener(GamificationService gamificationService, BudgetService budgetService) {
        this.gamificationService = gamificationService;
        this.budgetService = budgetService;
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void onCreated(TransactionActivity.Created event) {
        run("rewarding", event.transactionId(), () -> gamificationService.onTransactionCreated(event));
        run("checking the budget of", event.transactionId(), () -> budgetService.onTransactionCreated(event));
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void onDeleted(TransactionActivity.Deleted event) {
        run("reverting the XP of", event.transactionId(), () -> gamificationService.onTransactionDeleted(event));
    }

    private static void run(String action, Long transactionId, Runnable step) {
        try {
            step.run();
        } catch (RuntimeException e) {
            log.warn("Failed {} transaction {}", action, transactionId, e);
        }
    }
}
