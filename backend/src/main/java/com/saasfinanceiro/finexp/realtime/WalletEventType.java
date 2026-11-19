package com.saasfinanceiro.finexp.realtime;

/** tipos de evento da carteira */
public enum WalletEventType {
    TRANSACTION_CREATED,
    TRANSACTION_UPDATED,
    TRANSACTION_DELETED,
    WALLET_UPDATED,
    WALLET_DELETED,
    MEMBER_ADDED,
    MEMBER_ROLE_CHANGED,
    MEMBER_REMOVED
}
