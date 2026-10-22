import {
  ArrowDownCircle,
  ArrowUpCircle,
  ChevronLeft,
  ChevronRight,
  Inbox,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CategoryService from "../../../services/CategoryService";
import TransactionService from "../../../services/TransactionService";
import WalletService from "../../../services/WalletService";
import ConfirmDialog from "../../components/ConfirmDialog";
import TransactionFormModal from "../../components/transactions/TransactionFormModal";
import { useToast } from "../../components/useToast";
import { getErrorMessage } from "../../utils/errors";
import { formatCurrency, formatDate } from "../../utils/format";
import { pickWalletId, saveSelectedWallet } from "../../utils/selectedWallet";

const PAGE_SIZE = 10;
const EMPTY_FILTERS = { type: "", categoryId: "", startDate: "", endDate: "" };

const selectClass =
  "rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#cb9d6c]";

const Transactions = () => {
  const { addToast } = useToast();

  const [wallets, setWallets] = useState([]);
  const [walletId, setWalletId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [pageNumber, setPageNumber] = useState(0);
  const [reloadKey, setReloadKey] = useState(0);

  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // null = closed, {} = new transaction, transaction = edit
  const [formTransaction, setFormTransaction] = useState(null);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const periodInvalid =
    filters.startDate && filters.endDate && filters.startDate > filters.endDate;

  // Wallets and categories, loaded once.
  useEffect(() => {
    new WalletService()
      .list()
      .then((list) => {
        setWallets(list);
        setWalletId(pickWalletId(list));
        if (list.length === 0) setLoading(false);
      })
      .catch((err) => {
        setError(getErrorMessage(err, "Could not load your wallets."));
        setLoading(false);
      });

    new CategoryService()
      .list()
      .then(setCategories)
      .catch((err) => console.error("Error loading categories", err));
  }, []);

  // The transactions of the selected wallet for the current filters and page.
  useEffect(() => {
    if (walletId === null || periodInvalid) return;
    let cancelled = false;

    const params = { page: pageNumber, size: PAGE_SIZE, sort: "date,desc" };
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params[key] = value;
    });

    new TransactionService()
      .list(walletId, params)
      .then((data) => {
        if (cancelled) return;
        setPage(data);
        setError("");
      })
      .catch((err) => {
        if (cancelled) return;
        setError(getErrorMessage(err, "Could not load the transactions."));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [walletId, filters, pageNumber, reloadKey, periodInvalid]);

  const currentWallet = wallets.find((w) => w.id === walletId);
  const canWrite =
    currentWallet?.role === "OWNER" || currentWallet?.role === "EDITOR";

  const transactions = page?.content ?? [];
  const totalPages = page?.totalPages ?? page?.page?.totalPages ?? 1;
  const totalElements =
    page?.totalElements ?? page?.page?.totalElements ?? transactions.length;
  const hasFilters = Object.values(filters).some(Boolean);

  const reload = () => {
    setLoading(true);
    setReloadKey((k) => k + 1);
  };

  const updateFilters = (patch) => {
    setLoading(true);
    setPageNumber(0);
    setFilters((prev) => ({ ...prev, ...patch }));
  };

  const changeWallet = (id) => {
    setLoading(true);
    setPageNumber(0);
    setWalletId(id);
    saveSelectedWallet(id);
  };

  const goToPage = (n) => {
    setLoading(true);
    setPageNumber(n);
  };

  const handleSaved = () => {
    setFormTransaction(null);
    reload();
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await new TransactionService().remove(walletId, transactionToDelete.id);
      addToast({ type: "success", title: "Transaction deleted" });
      setTransactionToDelete(null);
      // Removing the last item of a page goes back one page.
      if (transactions.length === 1 && pageNumber > 0) {
        goToPage(pageNumber - 1);
      } else {
        reload();
      }
    } catch (err) {
      addToast({
        type: "error",
        title: "Could not delete the transaction",
        description: getErrorMessage(err),
      });
    } finally {
      setDeleting(false);
    }
  };

  if (wallets.length === 0 && !loading && !error) {
    return (
      <div className="mx-auto w-full max-w-7xl">
        <h1 className="text-2xl font-bold text-gray-800">Transactions</h1>
        <div className="mt-6 rounded-lg border border-dashed border-gray-300 bg-white px-4 py-10 text-center text-sm text-gray-500">
          You need a wallet before adding transactions.{" "}
          <Link
            to="/app/wallets"
            className="font-semibold text-[#a88d6f] hover:underline"
          >
            Create a wallet
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Transactions</h1>
          <p className="mt-1 text-sm text-gray-500">
            {currentWallet
              ? `${totalElements} transaction${totalElements === 1 ? "" : "s"} in "${currentWallet.name}"`
              : "Your revenues and expenses"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {wallets.length > 1 && (
            <select
              aria-label="Select wallet"
              value={walletId ?? ""}
              onChange={(e) => changeWallet(Number(e.target.value))}
              className={selectClass}
            >
              {wallets.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          )}

          {canWrite && (
            <button
              onClick={() => setFormTransaction({})}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#a88d6f] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#91755a]"
            >
              <Plus size={18} />
              New transaction
            </button>
          )}
        </div>
      </div>

      {currentWallet && !canWrite && (
        <p className="mb-4 text-xs text-gray-400">
          You have view-only access to this wallet
        </p>
      )}

      <div className="mb-6 grid grid-cols-1 gap-3 rounded-xl border border-gray-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-5">
        <select
          aria-label="Filter by type"
          value={filters.type}
          onChange={(e) => updateFilters({ type: e.target.value })}
          className={selectClass}
        >
          <option value="">All types</option>
          <option value="INCOME">Income</option>
          <option value="EXPENSE">Expense</option>
        </select>

        <select
          aria-label="Filter by category"
          value={filters.categoryId}
          onChange={(e) => updateFilters({ categoryId: e.target.value })}
          className={selectClass}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <input
          type="date"
          aria-label="From date"
          value={filters.startDate}
          onChange={(e) => updateFilters({ startDate: e.target.value })}
          className={selectClass}
        />
        <input
          type="date"
          aria-label="To date"
          value={filters.endDate}
          onChange={(e) => updateFilters({ endDate: e.target.value })}
          className={selectClass}
        />

        <button
          onClick={() => updateFilters(EMPTY_FILTERS)}
          disabled={!hasFilters}
          className="cursor-pointer rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:cursor-default disabled:opacity-40"
        >
          Clear filters
        </button>
      </div>

      {periodInvalid && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
        >
          The start date must not be after the end date.
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        {loading && !periodInvalid ? (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#a88d6f] border-t-transparent"></div>
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center px-4 py-16 text-gray-400">
            <Inbox size={48} className="mb-3 opacity-50" />
            <p className="text-sm font-medium">
              {hasFilters
                ? "No transactions match these filters."
                : "No transactions yet."}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {transactions.map((tx) => {
              const isIncome = tx.type === "INCOME";
              return (
                <li
                  key={tx.id}
                  className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className={`shrink-0 rounded-lg p-2 ${
                        isIncome
                          ? "bg-green-50 text-green-600"
                          : "bg-red-50 text-red-600"
                      }`}
                    >
                      {isIncome ? (
                        <ArrowUpCircle size={20} />
                      ) : (
                        <ArrowDownCircle size={20} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-700">
                        {tx.description || tx.categoryName || "No description"}
                      </p>
                      <p className="truncate text-xs text-gray-400">
                        {formatDate(tx.date)}
                        {tx.categoryName && ` · ${tx.categoryName}`}
                        {tx.createdBy && ` · ${tx.createdBy}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <span
                      className={`text-sm font-bold ${
                        isIncome ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {isIncome ? "+" : "-"} {formatCurrency(tx.amount)}
                    </span>
                    {canWrite && (
                      <>
                        <button
                          onClick={() => setFormTransaction(tx)}
                          aria-label="Edit transaction"
                          title="Edit"
                          className="cursor-pointer rounded p-1.5 text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => setTransactionToDelete(tx)}
                          aria-label="Delete transaction"
                          title="Delete"
                          className="cursor-pointer rounded p-1.5 text-gray-400 hover:bg-gray-50 hover:text-red-500"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3 text-sm text-gray-500 sm:px-6">
            <button
              onClick={() => goToPage(pageNumber - 1)}
              disabled={pageNumber === 0}
              className="flex cursor-pointer items-center gap-1 font-semibold disabled:cursor-default disabled:opacity-40"
            >
              <ChevronLeft size={16} />
              Previous
            </button>
            <span>
              Page {pageNumber + 1} of {totalPages}
            </span>
            <button
              onClick={() => goToPage(pageNumber + 1)}
              disabled={pageNumber + 1 >= totalPages}
              className="flex cursor-pointer items-center gap-1 font-semibold disabled:cursor-default disabled:opacity-40"
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {formTransaction && (
        <TransactionFormModal
          walletId={walletId}
          transaction={formTransaction.id ? formTransaction : null}
          categories={categories}
          onClose={() => setFormTransaction(null)}
          onSaved={handleSaved}
        />
      )}

      {transactionToDelete && (
        <ConfirmDialog
          title="Delete transaction"
          message={`"${
            transactionToDelete.description ||
            transactionToDelete.categoryName ||
            "This transaction"
          }" (${formatCurrency(transactionToDelete.amount)}) will be removed and the wallet balance adjusted.`}
          confirmLabel="Delete"
          busy={deleting}
          onConfirm={handleDelete}
          onCancel={() => setTransactionToDelete(null)}
        />
      )}
    </div>
  );
};

export default Transactions;
