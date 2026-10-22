import {
  ArrowDownCircle,
  ArrowUpCircle,
  DollarSign,
  Inbox,
  Plus,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import TransactionService from "../../../services/TransactionService";
import WalletService from "../../../services/WalletService";
import { formatCurrency, formatDate } from "../../utils/format";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xl min-w-37.5">
        <p className="text-gray-500 font-semibold text-sm mb-3 border-b border-gray-100 pb-2">
          {label}
        </p>

        <div className="flex flex-col gap-2">
          {payload.map((entry, index) => {
            const labelName =
              entry.name === "Revenues" ? "Revenues" : "Expenses";

            return (
              <div
                key={index}
                className="flex justify-between items-center gap-6 text-sm"
              >
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  ></div>
                  <span className="text-gray-600 font-medium">{labelName}</span>
                </div>

                <span className="font-bold text-gray-800">
                  {formatCurrency(entry.value)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
};

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const CHART_MONTHS = 6;
const RECENT_TRANSACTIONS = 5;

const pad = (n) => String(n).padStart(2, "0");

// Last CHART_MONTHS months (current one included) as yyyy-MM keys, plus the date range to query.
const buildPeriod = () => {
  const now = new Date();
  const months = [];
  for (let i = CHART_MONTHS - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(`${d.getFullYear()}-${pad(d.getMonth() + 1)}`);
  }
  return {
    months,
    startDate: `${months[0]}-01`,
    endDate: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`,
  };
};

const Dashboard = () => {
  const { user } = useOutletContext();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [wallets, setWallets] = useState([]);
  const [walletId, setWalletId] = useState(null);
  const [summary, setSummary] = useState({ revenues: 0, expenses: 0 });
  const [chartData, setChartData] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [goalsSummary] = useState([]);
  // setGoalsSummary

  // Wallets the user belongs to; the first one is selected by default.
  useEffect(() => {
    new WalletService()
      .list()
      .then((list) => {
        setWallets(list);
        setWalletId(list.length > 0 ? list[0].id : null);
        if (list.length === 0) setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading wallets", err);
        setError("Could not load your wallets.");
        setLoading(false);
      });
  }, []);

  // Summary, chart and recent transactions of the selected wallet.
  useEffect(() => {
    if (walletId === null) return;
    let cancelled = false;
    const { months, startDate, endDate } = buildPeriod();

    Promise.all([
      new WalletService().getSummary(walletId, startDate, endDate),
      new TransactionService().list(walletId, {
        size: RECENT_TRANSACTIONS,
        sort: "date,desc",
      }),
    ])
      .then(([data, page]) => {
        if (cancelled) return;
        const byMonth = new Map(data.byMonth.map((m) => [m.month, m]));
        const current = byMonth.get(months[months.length - 1]);

        setSummary({
          revenues: current?.income ?? 0,
          expenses: current?.expense ?? 0,
        });
        setChartData(
          months.map((key) => ({
            name: MONTH_LABELS[Number(key.slice(5)) - 1],
            Revenues: byMonth.get(key)?.income ?? 0,
            Expenses: byMonth.get(key)?.expense ?? 0,
          })),
        );
        setTransactions(page.content);
        setError("");
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Error loading dashboard data", err);
        setError("Could not load the dashboard data.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [walletId]);

  const currentWallet = wallets.find((w) => w.id === walletId);
  const hasChartData = chartData.some((d) => d.Revenues > 0 || d.Expenses > 0);

  if (loading) {
    return (
      <div className="flex h-full min-h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#a88d6f] border-t-transparent"></div>
          <p className="text-gray-500 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl w-full mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Hello, {user?.name}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {currentWallet
              ? `Summary of "${currentWallet.name}" for this month`
              : "Here is a summary of your financial health"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {wallets.length > 1 && (
            <select
              aria-label="Select wallet"
              value={walletId ?? ""}
              onChange={(e) => {
                setLoading(true);
                setWalletId(Number(e.target.value));
              }}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
            >
              {wallets.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          )}

          {/* TODO: add a new transaction modal. */}
          <button className="flex items-center justify-center gap-2 bg-[#a88d6f] hover:bg-[#91755a] text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-colors shadow-sm cursor-pointer">
            <Plus size={18} />
            <span className="font-semibold">New Transaction</span>
          </button>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {wallets.length === 0 && !error && (
        <div className="mb-6 rounded-lg border border-dashed border-gray-300 bg-white px-4 py-6 text-center text-sm text-gray-500">
          You don&apos;t have a wallet yet.{" "}
          <Link
            to="/app/wallets"
            className="font-semibold text-[#a88d6f] hover:underline"
          >
            Create your first wallet
          </Link>{" "}
          to start tracking your finances.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">
              Current Balance
            </p>
            <h3 className="text-2xl font-bold text-gray-800">
              {formatCurrency(currentWallet?.balance)}
            </h3>
          </div>
          <div className="p-3 bg-[#a88d6f]/10 text-[#a88d6f] rounded-lg">
            <DollarSign size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">
              Revenue this month
            </p>
            <h3 className="text-2xl font-bold text-green-600">
              {formatCurrency(summary.revenues)}
            </h3>
          </div>
          <div className="p-3 bg-green-50 text-green-600 rounded-lg">
            <ArrowUpCircle size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">
              Expenses this month
            </p>
            <h3 className="text-2xl font-bold text-red-600">
              {formatCurrency(summary.expenses)}
            </h3>
          </div>
          <div className="p-3 bg-red-50 text-red-600 rounded-lg">
            <ArrowDownCircle size={24} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm lg:col-span-2">
          <h2 className="text-lg font-bold text-gray-800 mb-6">
            Revenues and expenses (last 6 months)
          </h2>

          <div className="h-72 w-full flex items-center justify-center">
            {hasChartData ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="colorRevenues"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#16a34a"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor="#16a34a"
                        stopOpacity={0}
                      />
                    </linearGradient>
                    <linearGradient
                      id="colorExpenses"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#dc2626"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor="#dc2626"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f3f4f6"
                  />
                  <XAxis
                    dataKey="name"
                    stroke="#9ca3af"
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#9ca3af"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    iconType="circle"
                    wrapperStyle={{ fontSize: 12, paddingTop: 10 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="Revenues"
                    stroke="#16a34a"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRevenues)"
                  />
                  <Area
                    type="monotone"
                    dataKey="Expenses"
                    stroke="#dc2626"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorExpenses)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center text-gray-400">
                <Inbox size={48} className="mb-3 opacity-50" />
                <p className="text-sm font-medium">
                  Not enough data for charts yet.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800">My Goals</h2>
              <Link
                to="/app/wallets"
                className="text-xs font-semibold text-[#a88d6f] hover:underline"
              >
                View all
              </Link>
            </div>

            <div className="flex flex-col gap-4">
              {goalsSummary.length > 0 ? (
                goalsSummary.map((goal) => {
                  const pct = Math.min((goal.current / goal.target) * 100, 100);
                  return (
                    <div
                      key={goal.id}
                      className="flex flex-col gap-1.5 p-2.5 rounded-lg bg-gray-50 border border-gray-100"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-gray-700 truncate">
                          {goal.title}
                        </span>
                        <span className="text-xs px-1.5 py-0.5 rounded font-medium bg-gray-200 text-gray-600 capitalize">
                          {goal.type}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-[#a88d6f] h-full"
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>R$ {goal.current.toFixed(0)}</span>
                        <span>of R$ {goal.target.toFixed(0)}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-sm text-gray-400 py-4 border border-dashed border-gray-200 rounded-lg">
                  No goals defined yet.
                </div>
              )}
            </div>
          </div>

          {/* Recent transactions are placed below the goal summary to keep the layout compact. */}
          <div className="mt-6 border-t border-gray-100 pt-4">
            <h4 className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">
              Recent Transactions
            </h4>
            <div className="flex flex-col gap-3">
              {transactions.length > 0 ? (
                transactions.map((tx) => {
                  const isIncome = tx.type === "INCOME";
                  return (
                    <div
                      key={tx.id}
                      className="flex justify-between items-center gap-3 text-xs"
                    >
                      <div className="min-w-0">
                        <p className="text-gray-700 font-medium truncate">
                          {tx.description || tx.categoryName || "No description"}
                        </p>
                        <p className="text-gray-400">{formatDate(tx.date)}</p>
                      </div>
                      <span
                        className={`font-bold shrink-0 ${isIncome ? "text-green-600" : "text-red-600"}`}
                      >
                        {isIncome ? "+" : "-"} {formatCurrency(tx.amount)}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-sm text-gray-400 py-3">
                  No recent transactions.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
