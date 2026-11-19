import { Link } from "react-router-dom";
import { DEFAULT_CATEGORY_COLOR, getCategoryIcon } from "../../utils/categoryIcons";
import BudgetBar from "./BudgetBar";
import PixelSprite from "./PixelSprite";
import { ACHIEVEMENT_SPRITES } from "./sprites";
import useBudgets from "./useBudgets";

const SHIELD = ACHIEVEMENT_SPRITES.ON_BUDGET;

// Dashboard list of this month's budgets.
export default function BudgetsCard() {
  const { budgets, loading, error } = useBudgets();

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-800">Budgets this month</h2>
        <Link
          to="/app/categories"
          className="text-xs font-semibold text-[#a88d6f] hover:underline"
        >
          Manage
        </Link>
      </div>

      {loading && <div className="h-20 animate-pulse rounded-lg bg-gray-50" />}

      {!loading && error && <p className="text-sm text-gray-500">{error}</p>}

      {!loading && !error && budgets.length === 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-dashed border-gray-200 p-3 text-sm text-gray-500">
          <PixelSprite grid={SHIELD.grid} palette={SHIELD.palette} size={32} muted />
          <p>
            Set monthly limits on your{" "}
            <Link to="/app/categories" className="font-semibold text-[#a88d6f] hover:underline">
              expense categories
            </Link>{" "}
            and earn XP for each month you stay within them.
          </p>
        </div>
      )}

      {!loading && !error && budgets.length > 0 && (
        <div className="flex flex-col gap-3">
          {budgets.map((budget) => {
            const Icon = getCategoryIcon(budget.icon);
            return (
              <div
                key={budget.categoryId}
                className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 p-2.5"
              >
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white"
                  style={{ backgroundColor: budget.color || DEFAULT_CATEGORY_COLOR }}
                >
                  <Icon size={15} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="mb-1 truncate text-sm font-semibold text-gray-700">
                    {budget.categoryName}
                  </p>
                  <BudgetBar budget={budget} compact />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
