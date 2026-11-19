import { Loader2 } from "lucide-react";
import { useState } from "react";
import BudgetService from "../../../services/BudgetService";
import { getErrorMessage } from "../../utils/errors";
import { validateAmount } from "../../utils/validators";
import Input from "../Input";
import Modal from "../Modal";
import { useToast } from "../useToast";

// cria, edita ou remove o orçamento da categoria
export default function BudgetFormModal({ category, budget, onClose, onSaved }) {
  const { addToast } = useToast();
  const [limit, setLimit] = useState(budget ? String(budget.monthlyLimit) : "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(null); // "save" | "remove"

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validation = validateAmount(limit);
    if (validation) {
      setError(validation);
      return;
    }
    setBusy("save");
    try {
      await new BudgetService().save(category.id, Number(limit));
      addToast({ type: "success", title: `Budget of ${category.name} saved` });
      onSaved();
    } catch (err) {
      setError(getErrorMessage(err, "Could not save the budget."));
      setBusy(null);
    }
  };

  const handleRemove = async () => {
    setBusy("remove");
    try {
      await new BudgetService().remove(category.id);
      addToast({ type: "success", title: `Budget of ${category.name} removed` });
      onSaved();
    } catch (err) {
      setError(getErrorMessage(err, "Could not remove the budget."));
      setBusy(null);
    }
  };

  return (
    <Modal title={`Monthly budget: ${category.name}`} onClose={onClose}>
      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
        <p className="text-sm text-gray-500">
          Expenses in this category, in any wallet, count towards the limit. You get an alert at 80%
          and when it is exceeded, and +50 XP for every month that stays within it.
        </p>

        <Input
          label="Monthly limit (R$)"
          id="budget-limit"
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0"
          placeholder="0,00"
          autoFocus
          value={limit}
          error={error}
          onChange={(e) => {
            setLimit(e.target.value);
            if (error) setError("");
          }}
        />

        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          {budget ? (
            <button
              type="button"
              onClick={handleRemove}
              disabled={busy !== null}
              className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-red-600 hover:underline disabled:opacity-60"
            >
              {busy === "remove" && <Loader2 className="h-4 w-4 animate-spin" />}
              Remove budget
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy !== null}
              className="flex cursor-pointer items-center gap-2 rounded-lg bg-[#a88d6f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#91755a] disabled:opacity-60"
            >
              {busy === "save" && <Loader2 className="h-4 w-4 animate-spin" />}
              Save budget
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
