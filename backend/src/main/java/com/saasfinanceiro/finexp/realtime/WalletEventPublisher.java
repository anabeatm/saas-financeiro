package com.saasfinanceiro.finexp.realtime;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

import com.saasfinanceiro.finexp.model.Transaction;
import com.saasfinanceiro.finexp.model.User;
import com.saasfinanceiro.finexp.model.Wallet;
import com.saasfinanceiro.finexp.repository.WalletMemberRepository;

/** chamado quando uma carteira muda: pega os membros e publica o evento */
@Component
public class WalletEventPublisher {

    private final ApplicationEventPublisher applicationEventPublisher;
    private final WalletMemberRepository walletMemberRepository;

    public WalletEventPublisher(ApplicationEventPublisher applicationEventPublisher,
            WalletMemberRepository walletMemberRepository) {
        this.applicationEventPublisher = applicationEventPublisher;
        this.walletMemberRepository = walletMemberRepository;
    }

    public void transactionChanged(WalletEventType type, Wallet wallet, Transaction transaction, User actor) {
        publish(new WalletEvent(type, wallet.getId(), wallet.getName(), actor.getId(), actor.getName(),
                transaction.getType(), transaction.getAmount(), transaction.getDescription(), null,
                LocalDateTime.now()), wallet, null);
    }

    public void walletChanged(WalletEventType type, Wallet wallet, User actor) {
        publish(new WalletEvent(type, wallet.getId(), wallet.getName(), actor.getId(), actor.getName(),
                null, null, null, null, LocalDateTime.now()), wallet, null);
    }

    /** avisa o usuário afetado também (mesmo se acabou de ser removido) */
    public void memberChanged(WalletEventType type, Wallet wallet, User affectedUser, User actor) {
        publish(new WalletEvent(type, wallet.getId(), wallet.getName(), actor.getId(), actor.getName(),
                null, null, null, affectedUser.getId(), LocalDateTime.now()), wallet, affectedUser.getId());
    }

    private void publish(WalletEvent event, Wallet wallet, Long extraRecipient) {
        Set<Long> recipients = new HashSet<>(walletMemberRepository.findUserIdsByWalletId(wallet.getId()));
        if (extraRecipient != null) {
            recipients.add(extraRecipient);
        }
        applicationEventPublisher.publishEvent(new WalletEventMessage(event, Set.copyOf(recipients)));
    }
}
