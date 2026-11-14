package com.saasfinanceiro.finexp.realtime;

/** What changed in a wallet. Sent to the browser as the event's {@code type}. */
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
