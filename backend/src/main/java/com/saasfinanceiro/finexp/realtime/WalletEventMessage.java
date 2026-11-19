package com.saasfinanceiro.finexp.realtime;

import java.util.Set;

/** evento da carteira + quem recebe */
public record WalletEventMessage(WalletEvent event, Set<Long> recipientIds) {}
