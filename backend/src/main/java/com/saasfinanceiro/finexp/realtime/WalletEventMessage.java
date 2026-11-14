package com.saasfinanceiro.finexp.realtime;

import java.util.Set;

/**
 * Application event carrying a {@link WalletEvent} and who must receive it. The recipients are
 * resolved when the change happens, so they are still known after a wallet or member is deleted.
 */
public record WalletEventMessage(WalletEvent event, Set<Long> recipientIds) {}
