import { formatCurrency } from "../../utils/format";

// textos da gamificação

export const XP_REASONS = {
  TRANSACTION: "Transaction logged",
  CHECK_IN: "No-spending day",
  STREAK_BONUS: "Streak bonus",
  BUDGET_MET: "Budget met",
  MONTH_SAVINGS: "Month closed with savings",
};

// regras do jogo (iguais às da api)
export const XP_RULES = [
  { action: "Log a transaction", xp: "+5", note: "Up to 10 per day, dated in the last 3 days. Deleting it within 24 h takes the XP back." },
  { action: "Check in a no-spending day", xp: "+5", note: "Once a day, only on days without expenses." },
  { action: "7-day streak", xp: "+30", note: "Every 7 days in a row also earn a freeze (up to 2) that covers a missed day." },
  { action: "30-day streak", xp: "+150", note: "Once per streak." },
  { action: "Close a month within a budget", xp: "+50", note: "For each expense category that stayed within its limit." },
  { action: "Close a month with savings", xp: "+100 to +200", note: "+10 for every 5% of your income saved." },
];

// títulos por nível
export const TIERS = [
  { title: "Beginner", from: 1 },
  { title: "Organized", from: 5 },
  { title: "Saver", from: 10 },
  { title: "Strategist", from: 15 },
  { title: "Finance Master", from: 20 },
];

export const nextTier = (level) => TIERS.find((t) => t.from > level) ?? null;

// "R$ 80,00 of R$ 100,00"
export const budgetUsage = (budget) =>
  `${formatCurrency(budget.spent)} of ${formatCurrency(budget.monthlyLimit)}`;

// cor da barra pelo status
export const BUDGET_BAR_COLORS = {
  OK: "bg-[#a88d6f]",
  WARNING: "bg-amber-500",
  EXCEEDED: "bg-red-500",
};

// data da api -> "18/11/2026"
export const formatInstant = (instant) =>
  instant ? new Date(instant).toLocaleDateString("pt-BR") : "";
