import { useCallback, useEffect, useRef, useState } from "react";
import BudgetService from "../../../services/BudgetService";
import { useGamificationEvents, useWalletEvents } from "../../realtime/useRealtime";
import { getErrorMessage } from "../../utils/errors";

const RELOAD_DELAY_MS = 400;

// Budgets of the current month with their spending, reloaded when transactions change.
export default function useBudgets() {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const timer = useRef(null);

  const reload = useCallback(async () => {
    try {
      setBudgets(await new BudgetService().list());
      setError("");
    } catch (err) {
      setError(getErrorMessage(err, "Could not load your budgets."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
    return () => clearTimeout(timer.current);
  }, [reload]);

  const scheduleReload = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(reload, RELOAD_DELAY_MS);
  };

  useWalletEvents((event) => {
    if (event.type?.startsWith("TRANSACTION_")) scheduleReload();
  });
  useGamificationEvents((event) => {
    if (event.type?.startsWith("BUDGET_")) scheduleReload();
  });

  return { budgets, loading, error, reload };
}
