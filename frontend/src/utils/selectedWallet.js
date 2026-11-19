const STORAGE_KEY = "selectedWalletId";

// lembra a carteira selecionada
export const saveSelectedWallet = (walletId) => {
  try {
    localStorage.setItem(STORAGE_KEY, String(walletId));
  } catch {
    // storage unavailable
  }
};

// carteira salva, ou a primeira
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
