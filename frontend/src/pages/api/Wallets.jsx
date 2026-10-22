import { Inbox, Pencil, Plus, Trash2, Users } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import WalletService from "../../../services/WalletService";
import ConfirmDialog from "../../components/ConfirmDialog";
import MembersModal from "../../components/wallets/MembersModal";
import WalletFormModal from "../../components/wallets/WalletFormModal";
import { useToast } from "../../components/useToast";
import { getErrorMessage } from "../../utils/errors";
import { formatCurrency } from "../../utils/format";

const ROLE_LABELS = { OWNER: "Owner", EDITOR: "Editor", VIEWER: "Viewer" };

const Wallets = () => {
  const { user } = useOutletContext();
  const { addToast } = useToast();

  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Which dialog is open: a form (null = closed, {} = new, wallet = edit), members or delete.
  const [formWallet, setFormWallet] = useState(null);
  const [membersWallet, setMembersWallet] = useState(null);
  const [walletToDelete, setWalletToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadWallets = useCallback(async () => {
    try {
      setWallets(await new WalletService().list());
      setError("");
    } catch (err) {
      setError(getErrorMessage(err, "Could not load your wallets."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWallets();
  }, [loadWallets]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await new WalletService().remove(walletToDelete.id);
      addToast({ type: "success", title: "Wallet deleted" });
      setWalletToDelete(null);
      await loadWallets();
    } catch (err) {
      addToast({
        type: "error",
        title: "Could not delete the wallet",
        description: getErrorMessage(err),
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleSaved = async () => {
    setFormWallet(null);
    await loadWallets();
  };

  const isOwner = (wallet) =>
    wallet.role ? wallet.role === "OWNER" : user?.id === wallet.ownerId;

  if (loading) {
    return (
      <div className="flex h-full min-h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#a88d6f] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Wallets</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your wallets and share them with other people
          </p>
        </div>
        <button
          onClick={() => setFormWallet({})}
          className="flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#a88d6f] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#91755a]"
        >
          <Plus size={18} />
          New wallet
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {wallets.length === 0 && !error ? (
        <div className="flex flex-col items-center rounded-xl border border-dashed border-gray-300 bg-white px-4 py-12 text-gray-400">
          <Inbox size={48} className="mb-3 opacity-50" />
          <p className="text-sm font-medium">You don&apos;t have any wallet yet.</p>
          <p className="text-sm">Create one to start tracking your finances.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {wallets.map((wallet) => (
            <div
              key={wallet.id}
              className="flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h2 className="truncate text-lg font-bold text-gray-800">
                    {wallet.name}
                  </h2>
                  <span
                    className={`shrink-0 rounded px-2 py-0.5 text-xs font-medium ${
                      isOwner(wallet)
                        ? "bg-[#a88d6f]/10 text-[#a88d6f]"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {ROLE_LABELS[wallet.role] ?? "Shared with you"}
                  </span>
                </div>
                {wallet.description && (
                  <p className="mt-1 text-sm text-gray-500">
                    {wallet.description}
                  </p>
                )}
                {!isOwner(wallet) && (
                  <p className="mt-1 text-xs text-gray-400">
                    Only the owner can edit this wallet
                  </p>
                )}
                <p className="mt-3 text-xs font-medium uppercase tracking-wider text-gray-400">
                  Balance
                </p>
                <p
                  className={`text-2xl font-bold ${
                    Number(wallet.balance) < 0 ? "text-red-600" : "text-gray-800"
                  }`}
                >
                  {formatCurrency(wallet.balance)}
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
                <button
                  onClick={() => setMembersWallet(wallet)}
                  className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-[#a88d6f] hover:underline"
                >
                  <Users size={16} />
                  Members
                </button>

                {isOwner(wallet) && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setFormWallet(wallet)}
                      aria-label={`Edit ${wallet.name}`}
                      title="Edit"
                      className="cursor-pointer rounded p-1.5 text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => setWalletToDelete(wallet)}
                      aria-label={`Delete ${wallet.name}`}
                      title="Delete"
                      className="cursor-pointer rounded p-1.5 text-gray-400 hover:bg-gray-50 hover:text-red-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {formWallet && (
        <WalletFormModal
          wallet={formWallet.id ? formWallet : null}
          onClose={() => setFormWallet(null)}
          onSaved={handleSaved}
        />
      )}

      {membersWallet && (
        <MembersModal
          wallet={membersWallet}
          isOwner={isOwner(membersWallet)}
          onClose={() => setMembersWallet(null)}
        />
      )}

      {walletToDelete && (
        <ConfirmDialog
          title="Delete wallet"
          message={`"${walletToDelete.name}" and all of its transactions will be permanently deleted for every member. This cannot be undone.`}
          confirmLabel="Delete wallet"
          busy={deleting}
          onConfirm={handleDelete}
          onCancel={() => setWalletToDelete(null)}
        />
      )}
    </div>
  );
};

export default Wallets;
