import { BUDGET_BAR_COLORS, budgetUsage } from "./labels";

// Spending of a budget in the month: bar colored by status plus "R$ x of R$ y".
export default function BudgetBar({ budget, compact = false }) {
  const pct = Math.min(budget.percent, 100);
  return (
    <div className="w-full">
      <div
        className={`w-full overflow-hidden rounded-full bg-gray-200 ${compact ? "h-1.5" : "h-2"}`}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={budget.percent}
        aria-label={`${budget.categoryName} budget used`}
      >
        <div
          className={`h-full ${BUDGET_BAR_COLORS[budget.status] ?? BUDGET_BAR_COLORS.OK}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-1 flex justify-between gap-2 text-xs text-gray-400">
        <span className="truncate">{budgetUsage(budget)}</span>
        <span
          className={`shrink-0 font-semibold ${
            budget.status === "EXCEEDED"
              ? "text-red-600"
              : budget.status === "WARNING"
                ? "text-amber-600"
                : "text-gray-500"
          }`}
        >
          {budget.percent}%
        </span>
      </div>
    </div>
  );
}
