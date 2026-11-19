package com.saasfinanceiro.finexp.realtime;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.context.ApplicationEventPublisher;

import com.saasfinanceiro.finexp.model.Transaction;
import com.saasfinanceiro.finexp.model.User;
import com.saasfinanceiro.finexp.model.Wallet;
import com.saasfinanceiro.finexp.model.enums.TransactionType;
import com.saasfinanceiro.finexp.repository.WalletMemberRepository;

class WalletEventPublisherTest {

    private ApplicationEventPublisher applicationEventPublisher;
    private WalletMemberRepository walletMemberRepository;
    private WalletEventPublisher publisher;

    private Wallet wallet;
    private User owner;

    @BeforeEach
    void setUp() {
        applicationEventPublisher = mock(ApplicationEventPublisher.class);
        walletMemberRepository = mock(WalletMemberRepository.class);
        publisher = new WalletEventPublisher(applicationEventPublisher, walletMemberRepository);

        owner = user(1L, "Ana");
        wallet = new Wallet();
        wallet.setId(10L);
        wallet.setName("Household");

        when(walletMemberRepository.findUserIdsByWalletId(10L)).thenReturn(List.of(1L, 2L));
    }

    @Test
    void transactionEventGoesToEveryMemberWithTheTransactionData() {
        Transaction transaction = new Transaction();
        transaction.setType(TransactionType.EXPENSE);
        transaction.setAmount(new BigDecimal("42.50"));
        transaction.setDescription("Groceries");

        publisher.transactionChanged(WalletEventType.TRANSACTION_CREATED, wallet, transaction, owner);

        WalletEventMessage message = publishedMessage();
        assertEquals(Set.of(1L, 2L), message.recipientIds());

        WalletEvent event = message.event();
        assertEquals(WalletEventType.TRANSACTION_CREATED, event.type());
        assertEquals(10L, event.walletId());
        assertEquals("Household", event.walletName());
        assertEquals(1L, event.actorId());
        assertEquals("Ana", event.actorName());
        assertEquals(TransactionType.EXPENSE, event.transactionType());
        assertEquals(new BigDecimal("42.50"), event.amount());
        assertEquals("Groceries", event.description());
        assertNull(event.affectedUserId());
    }

    @Test
    void walletEventHasNoTransactionData() {
        publisher.walletChanged(WalletEventType.WALLET_UPDATED, wallet, owner);

        WalletEvent event = publishedMessage().event();
        assertEquals(WalletEventType.WALLET_UPDATED, event.type());
        assertNull(event.amount());
        assertNull(event.transactionType());
    }

    @Test
    void memberEventAlsoReachesTheAffectedUser() {
        // membro sendo removido
        User removed = user(3L, "Bia");

        publisher.memberChanged(WalletEventType.MEMBER_REMOVED, wallet, removed, owner);

        WalletEventMessage message = publishedMessage();
        assertEquals(Set.of(1L, 2L, 3L), message.recipientIds());
        assertEquals(3L, message.event().affectedUserId());
    }

    private WalletEventMessage publishedMessage() {
        ArgumentCaptor<WalletEventMessage> captor = ArgumentCaptor.forClass(WalletEventMessage.class);
        verify(applicationEventPublisher).publishEvent(captor.capture());
        return captor.getValue();
    }

    private static User user(Long id, String name) {
        User user = new User();
        user.setId(id);
        user.setName(name);
        return user;
    }
}
