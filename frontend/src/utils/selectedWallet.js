const STORAGE_KEY = "selectedWalletId";

// The wallet chosen in one page is remembered by the others (dashboard, transactions).
export const saveSelectedWallet = (walletId) => {
  try {
    localStorage.setItem(STORAGE_KEY, String(walletId));
  } catch {
    // storage unavailable: the selection just won't be remembered
  }
};

// Returns the remembered wallet id if the user still has it, otherwise the first wallet (or null).
export const pickWalletId = (wallets) => {
  if (wallets.length === 0) return null;
  let saved = null;
  try {
    saved = Number(localStorage.getItem(STORAGE_KEY));
  } catch {
    saved = null;
  }
  return wallets.some((w) => w.id === saved) ? saved : wallets[0].id;
};
