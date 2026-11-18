import { Loader2, Plus, Sparkles } from "lucide-react";
import { useState } from "react";
import AiService from "../../../services/AiService";
import TransactionService from "../../../services/TransactionService";
import { getErrorMessage } from "../../utils/errors";
import { todayISO } from "../../utils/format";
import {
  validateAmount,
  validatePastOrPresentDate,
} from "../../utils/validators";
import CategoryFormModal from "../categories/CategoryFormModal";
import Input from "../Input";
import Modal from "../Modal";
import { useToast } from "../useToast";

const TYPES = [
  { value: "EXPENSE", label: "Expense", active: "bg-red-600 text-white" },
  { value: "INCOME", label: "Income", active: "bg-green-600 text-white" },
];

// Creates a transaction in `walletId`, or edits `transaction` when it is passed in.
// A category can also be created from here; `onCategoryCreated` lets the page update its own list.
export default function TransactionFormModal({
  walletId,
  transaction,
  categories: initialCategories,
  onClose,
  onSaved,
  onCategoryCreated,
}) {
  const isEdit = Boolean(transaction);
  const { addToast } = useToast();
  const today = todayISO();

  const [type, setType] = useState(transaction?.type ?? "EXPENSE");
  const [amount, setAmount] = useState(
    transaction ? String(transaction.amount) : "",
  );
  const [description, setDescription] = useState(
    transaction?.description ?? "",
  );
  const [date, setDate] = useState(transaction?.date ?? today);
  const [categoryId, setCategoryId] = useState(
    transaction?.categoryId ? String(transaction.categoryId) : "",
  );
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  const [suggestionNote, setSuggestionNote] = useState(null);
  // Categories created from this form, and the "new category" dialog (null = closed).
  const [createdCategories, setCreatedCategories] = useState([]);
  const [newCategoryForm, setNewCategoryForm] = useState(null);

  const categories = [...initialCategories, ...createdCategories];

  // Only categories of the chosen type; a category owned by another member is kept as read-only option.
  const options = categories.filter((c) => c.type === type);
  const keepsForeignCategory =
    isEdit &&
    transaction.categoryId &&
    transaction.type === type &&
    !categories.some((c) => c.id === transaction.categoryId);

  // Asks the AI which of the user's categories fits the description (of the selected type).
  const handleSuggestCategory = async () => {
    setSuggesting(true);
    setSuggestionNote(null);
    try {
      const suggestion = await new AiService().suggestCategory(description.trim(), type);
      if (suggestion.categoryId) {
        setCategoryId(String(suggestion.categoryId));
        setSuggestionNote({ ok: true, text: `Suggested by AI: ${suggestion.categoryName}` });
      } else if (suggestion.newCategory) {
        // None of the user's categories fits: offer to create the one the AI proposed.
        setSuggestionNote({
          ok: true,
          text: `No matching category. AI suggests creating "${suggestion.newCategory.name}".`,
          proposal: suggestion.newCategory,
        });
      } else {
        setSuggestionNote({ ok: false, text: "No matching category found." });
      }
    } catch (err) {
      setSuggestionNote({
        ok: false,
        text: getErrorMessage(err, "Could not get a suggestion right now."),
      });
    } finally {
      setSuggesting(false);
    }
  };

  // A category was created in the dialog: list it and select it when it matches the transaction type.
  const handleCategoryCreated = (category) => {
    setNewCategoryForm(null);
    setCreatedCategories((prev) => [...prev, category]);
    onCategoryCreated?.(category);
    if (category.type === type) {
      setCategoryId(String(category.id));
      setSuggestionNote({ ok: true, text: `Category "${category.name}" created and selected.` });
    } else {
      setSuggestionNote({
        ok: true,
        text: `Category "${category.name}" created as ${category.type === "INCOME" ? "income" : "expense"}.`,
      });
    }
  };

  const handleTypeChange = (newType) => {
    setType(newType);
    const stillValid = categories.some(
      (c) => String(c.id) === categoryId && c.type === newType,
    );
    const keepsOriginal =
      isEdit &&
      String(transaction.categoryId) === categoryId &&
      transaction.type === newType;
    if (!stillValid && !keepsOriginal) setCategoryId("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nextErrors = {
      amount: validateAmount(amount),
      date: validatePastOrPresentDate(date, today),
    };
    setErrors(nextErrors);
    if (nextErrors.amount || nextErrors.date) return;

    setSaving(true);
    try {
      const service = new TransactionService();
      const payload = {
        type,
        amount: Number(amount),
        description: description.trim() || null,
        date,
        categoryId: categoryId ? Number(categoryId) : null,
      };
      const saved = isEdit
        ? await service.update(walletId, transaction.id, payload)
        : await service.create(walletId, payload);

      addToast({
        type: "success",
        title: isEdit ? "Transaction updated" : "Transaction added",
      });
      onSaved(saved);
    } catch (err) {
      addToast({
        type: "error",
        title: "Could not save the transaction",
        description: getErrorMessage(err),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
    <Modal
      title={isEdit ? "Edit transaction" : "New transaction"}
      onClose={onClose}
      closeOnEscape={!newCategoryForm}
    >
      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div
          role="group"
          aria-label="Transaction type"
          className="grid grid-cols-2 gap-1 rounded-lg bg-gray-100 p-1"
        >
          {TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              aria-pressed={type === t.value}
              onClick={() => handleTypeChange(t.value)}
              className={`cursor-pointer rounded-md py-2 text-sm font-semibold transition-colors ${
                type === t.value ? t.active : "text-gray-500 hover:bg-gray-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <Input
          label="Amount (R$)"
          id="tx-amount"
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0"
          placeholder="0,00"
          autoFocus
          value={amount}
          error={errors.amount}
          onChange={(e) => {
            setAmount(e.target.value);
            if (errors.amount) {
              setErrors((p) => ({ ...p, amount: validateAmount(e.target.value) }));
            }
          }}
        />

        <Input
          label="Date"
          id="tx-date"
          type="date"
          max={today}
          value={date}
          error={errors.date}
          onChange={(e) => {
            setDate(e.target.value);
            if (errors.date) {
              setErrors((p) => ({
                ...p,
                date: validatePastOrPresentDate(e.target.value, today),
              }));
            }
          }}
        />

        <Input
          label="Description (optional)"
          id="tx-description"
          placeholder="e.g. Groceries"
          maxLength={255}
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            setSuggestionNote(null);
          }}
        />

        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between gap-2">
            <label
              htmlFor="tx-category"
              className="text-sm font-semibold text-[#0c0c0c]"
            >
              Category (optional)
            </label>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleSuggestCategory}
                disabled={!description.trim() || suggesting}
                title={
                  description.trim()
                    ? "Let the AI pick a category from the description"
                    : "Type a description first"
                }
                className="flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-[#a88d6f] hover:bg-[#a88d6f]/10 disabled:cursor-default disabled:opacity-40"
              >
                {suggesting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Sparkles size={14} />
                )}
                Suggest with AI
              </button>
              <button
                type="button"
                onClick={() => setNewCategoryForm({})}
                title="Create a new category"
                className="flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-gray-500 hover:bg-gray-100"
              >
                <Plus size={14} />
                New
              </button>
            </div>
          </div>
          <select
            id="tx-category"
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value);
              setSuggestionNote(null);
            }}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 outline-none focus:ring-2 focus:ring-[#cb9d6c]"
          >
            <option value="">No category</option>
            {keepsForeignCategory && (
              <option value={transaction.categoryId}>
                {transaction.categoryName} (from another member)
              </option>
            )}
            {options.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {suggestionNote && (
            <div
              role="status"
              className={`flex flex-wrap items-center gap-x-2 text-xs ${
                suggestionNote.ok ? "text-[#a88d6f]" : "text-gray-500"
              }`}
            >
              <span>{suggestionNote.text}</span>
              {suggestionNote.proposal && (
                <button
                  type="button"
                  onClick={() => setNewCategoryForm(suggestionNote.proposal)}
                  className="cursor-pointer font-semibold underline hover:text-[#91755a]"
                >
                  Create it
                </button>
              )}
            </div>
          )}
        </div>

        <div className="mt-2 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex cursor-pointer items-center gap-2 rounded-lg bg-[#a88d6f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#91755a] disabled:opacity-60"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEdit ? "Save changes" : "Add transaction"}
          </button>
        </div>
      </form>
    </Modal>

    {/* Opens on top of the transaction form; empty, or filled with the AI proposal. */}
    {newCategoryForm && (
      <CategoryFormModal
        defaultType={newCategoryForm.type ?? type}
        initialValues={newCategoryForm}
        onClose={() => setNewCategoryForm(null)}
        onSaved={handleCategoryCreated}
      />
    )}
    </>
  );
}
