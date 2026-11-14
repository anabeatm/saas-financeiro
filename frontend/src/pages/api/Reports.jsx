import {
  ArrowDownCircle,
  ArrowUpCircle,
  Download,
  Inbox,
  Loader2,
  Printer,
  Scale,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ReportService from "../../../services/ReportService";
import WalletService from "../../../services/WalletService";
import { useToast } from "../../components/useToast";
import { useWalletEvents } from "../../realtime/useRealtime";
import { getErrorMessage } from "../../utils/errors";
import { formatCurrency, formatDate, todayISO } from "../../utils/format";
import { pickWalletId, saveSelectedWallet } from "../../utils/selectedWallet";

const MAX_PERIOD_DAYS = 366;

const PRESETS = [
  { value: "thisMonth", label: "This month" },
  { value: "lastMonth", label: "Last month" },
  { value: "last3Months", label: "Last 3 months" },
  { value: "thisYear", label: "This year" },
  { value: "custom", label: "Custom" },
];

const pad = (n) => String(n).padStart(2, "0");
const toISO = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// Start and end dates (yyyy-MM-dd) of a preset, relative to today.
const presetPeriod = (preset) => {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  switch (preset) {
    case "lastMonth":
      return { startDate: toISO(new Date(y, m - 1, 1)), endDate: toISO(new Date(y, m, 0)) };
    case "last3Months":
      return { startDate: toISO(new Date(y, m - 2, 1)), endDate: todayISO() };
    case "thisYear":
      return { startDate: `${y}-01-01`, endDate: todayISO() };
    default:
      return { startDate: toISO(new Date(y, m, 1)), endDate: todayISO() };
  }
};

const daysBetween = (start, end) =>
  Math.round((new Date(`${end}T00:00:00`) - new Date(`${start}T00:00:00`)) / 86400000);

// Same rules as the API, checked before calling it.
const periodError = ({ startDate, endDate }) => {
  if (!startDate || !endDate) return "Choose the start and end dates.";
  if (startDate > endDate) return "The start date must not be after the end date.";
  if (daysBetween(startDate, endDate) >= MAX_PERIOD_DAYS) {
    return "The report period cannot be longer than one year.";
  }
  return "";
};

const SummaryCard = ({ label, value, icon, tone }) => {
  const Icon = icon;
  return (
  <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm print:shadow-none">
    <div>
      <p className="mb-1 text-sm font-medium text-gray-500">{label}</p>
      <p className={`text-xl font-bold ${tone}`}>{formatCurrency(value)}</p>
    </div>
    <div className="rounded-lg bg-gray-50 p-2.5 text-gray-400 print:hidden">
      <Icon size={22} />
    </div>
  </div>
  );
};

const CategoryBreakdown = ({ title, items, barColor }) => (
  <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm print:shadow-none">
    <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-400">
      {title}
    </h2>
    {items.length === 0 ? (
      <p className="text-sm text-gray-400">Nothing in this period.</p>
    ) : (
      <ul className="flex flex-col gap-3">
        {items.map((c) => (
          <li key={`${c.type}-${c.categoryId ?? "none"}`}>
            <div className="mb-1 flex justify-between gap-3 text-sm">
              <span className="truncate font-medium text-gray-700">
                {c.categoryName}{" "}
                <span className="text-xs font-normal text-gray-400">
                  ({c.count})
                </span>
              </span>
              <span className="shrink-0 text-gray-600">
                {formatCurrency(c.total)} · {Number(c.percentage).toFixed(1)}%
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className={`h-full ${barColor} print:bg-gray-500`}
                style={{ width: `${Math.min(Number(c.percentage), 100)}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    )}
  </div>
);

const Reports = () => {
  const { addToast } = useToast();

  const [wallets, setWallets] = useState([]);
  const [walletId, setWalletId] = useState(null);
  const [preset, setPreset] = useState("thisMonth");
  const [period, setPeriod] = useState(() => presetPeriod("thisMonth"));

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [walletsKey, setWalletsKey] = useState(0);
  const [reportKey, setReportKey] = useState(0);

  const invalidPeriod = periodError(period);

  useEffect(() => {
    new WalletService()
      .list()
      .then((list) => {
        setWallets(list);
        setWalletId((current) =>
          list.some((w) => w.id === current) ? current : pickWalletId(list),
        );
        if (list.length === 0) setLoading(false);
      })
      .catch((err) => {
        setError(getErrorMessage(err, "Could not load your wallets."));
        setLoading(false);
      });
  }, [walletsKey]);

  // The report on screen is regenerated when its wallet changes in real time.
  useWalletEvents((event) => {
    if (!event.type.startsWith("TRANSACTION_")) setWalletsKey((k) => k + 1);
    if (event.walletId === walletId) setReportKey((k) => k + 1);
  });

  useEffect(() => {
    if (walletId === null || invalidPeriod) return;
    let cancelled = false;

    new ReportService()
      .getStatement(walletId, period.startDate, period.endDate)
      .then((data) => {
        if (cancelled) return;
        setReport(data);
        setError("");
      })
      .catch((err) => {
        if (cancelled) return;
        setReport(null);
        setError(getErrorMessage(err, "Could not generate the report."));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [walletId, period, invalidPeriod, reportKey]);

  const changePreset = (value) => {
    setPreset(value);
    if (value !== "custom") {
      setLoading(true);
      setPeriod(presetPeriod(value));
    }
  };

  const changeDate = (field, value) => {
    setLoading(true);
    setPeriod((prev) => ({ ...prev, [field]: value }));
  };

  const changeWallet = (id) => {
    setLoading(true);
    setWalletId(id);
    saveSelectedWallet(id);
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const blob = await new ReportService().downloadStatementCsv(
        walletId,
        period.startDate,
        period.endDate,
      );
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `statement-${period.startDate}-${period.endDate}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      addToast({
        type: "error",
        title: "Could not download the CSV",
        description: getErrorMessage(err),
      });
    } finally {
      setDownloading(false);
    }
  };

  if (wallets.length === 0 && !loading && !error) {
    return (
      <div className="mx-auto w-full max-w-7xl">
        <h1 className="text-2xl font-bold text-gray-800">Reports</h1>
        <div className="mt-6 rounded-lg border border-dashed border-gray-300 bg-white px-4 py-10 text-center text-sm text-gray-500">
          You need a wallet to generate reports.{" "}
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

  const expenses = report?.byCategory.filter((c) => c.type === "EXPENSE") ?? [];
  const incomes = report?.byCategory.filter((c) => c.type === "INCOME") ?? [];
  const showSpinner = loading && !invalidPeriod;
  const canExport = report && !invalidPeriod && !showSpinner;

  return (
    <div className="mx-auto w-full max-w-7xl">
      {/* Title used only when printing / saving as PDF */}
      {report && (
        <div className="mb-6 hidden print:block">
          <p className="text-xl font-bold">FinEXP — Statement</p>
          <p className="text-sm">
            {report.walletName} · {formatDate(report.startDate)} to{" "}
            {formatDate(report.endDate)}
          </p>
        </div>
      )}

      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Reports</h1>
          <p className="mt-1 text-sm text-gray-500">
            Statement of a wallet for a period, with totals by category
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDownload}
            disabled={!canExport || downloading}
            className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-default disabled:opacity-50"
          >
            {downloading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Download size={16} />
            )}
            Download CSV
          </button>
          <button
            onClick={() => window.print()}
            disabled={!canExport}
            className="flex cursor-pointer items-center gap-2 rounded-lg bg-[#a88d6f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#91755a] disabled:cursor-default disabled:opacity-50"
          >
            <Printer size={16} />
            Print / PDF
          </button>
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 lg:flex-row lg:items-center print:hidden">
        {wallets.length > 1 && (
          <select
            aria-label="Select wallet"
            value={walletId ?? ""}
            onChange={(e) => changeWallet(Number(e.target.value))}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
          >
            {wallets.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        )}

        <div
          role="group"
          aria-label="Period"
          className="flex flex-wrap gap-1 rounded-lg bg-gray-100 p-1"
        >
          {PRESETS.map((p) => (
            <button
              key={p.value}
              aria-pressed={preset === p.value}
              onClick={() => changePreset(p.value)}
              className={`cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                preset === p.value
                  ? "bg-white text-[#a88d6f] shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {preset === "custom" && (
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="date"
              aria-label="From date"
              value={period.startDate}
              onChange={(e) => changeDate("startDate", e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
            />
            <span className="text-sm text-gray-400">to</span>
            <input
              type="date"
              aria-label="To date"
              value={period.endDate}
              onChange={(e) => changeDate("endDate", e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
            />
          </div>
        )}

        {preset !== "custom" && (
          <p className="text-sm text-gray-500">
            {formatDate(period.startDate)} – {formatDate(period.endDate)}
          </p>
        )}
      </div>

      {invalidPeriod && (
        <div
          role="alert"
          className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 print:hidden"
        >
          {invalidPeriod}
        </div>
      )}

      {error && !invalidPeriod && (
        <div
          role="alert"
          className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {showSpinner ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#a88d6f] border-t-transparent"></div>
        </div>
      ) : (
        report &&
        !invalidPeriod && (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 print:grid-cols-4">
              <SummaryCard
                label="Opening balance"
                value={report.openingBalance}
                icon={Wallet}
                tone="text-gray-800"
              />
              <SummaryCard
                label="Income"
                value={report.totalIncome}
                icon={ArrowUpCircle}
                tone="text-green-600"
              />
              <SummaryCard
                label="Expenses"
                value={report.totalExpense}
                icon={ArrowDownCircle}
                tone="text-red-600"
              />
              <SummaryCard
                label="Closing balance"
                value={report.closingBalance}
                icon={Scale}
                tone={
                  Number(report.closingBalance) < 0
                    ? "text-red-600"
                    : "text-gray-800"
                }
              />
            </div>

            <p className="mt-3 text-sm text-gray-500">
              Net result of the period:{" "}
              <span
                className={`font-semibold ${
                  Number(report.netResult) < 0 ? "text-red-600" : "text-green-600"
                }`}
              >
                {formatCurrency(report.netResult)}
              </span>{" "}
              in {report.transactionCount} transaction
              {report.transactionCount === 1 ? "" : "s"}.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2 print:grid-cols-2">
              <CategoryBreakdown
                title="Expenses by category"
                items={expenses}
                barColor="bg-red-500"
              />
              <CategoryBreakdown
                title="Income by category"
                items={incomes}
                barColor="bg-green-500"
              />
            </div>

            <div className="mt-6 rounded-xl border border-gray-200 bg-white shadow-sm print:shadow-none">
              <h2 className="border-b border-gray-100 px-5 py-4 text-sm font-bold uppercase tracking-wider text-gray-400">
                Statement
              </h2>
              {report.entries.length === 0 ? (
                <div className="flex flex-col items-center px-4 py-12 text-gray-400">
                  <Inbox size={40} className="mb-2 opacity-50" />
                  <p className="text-sm">No transactions in this period.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-160 text-left text-sm">
                    <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                      <tr>
                        <th className="px-5 py-3 font-semibold">Date</th>
                        <th className="px-5 py-3 font-semibold">Description</th>
                        <th className="px-5 py-3 font-semibold">Category</th>
                        <th className="px-5 py-3 font-semibold">By</th>
                        <th className="px-5 py-3 text-right font-semibold">Amount</th>
                        <th className="px-5 py-3 text-right font-semibold">Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      <tr className="text-gray-500">
                        <td className="px-5 py-2.5">{formatDate(report.startDate)}</td>
                        <td className="px-5 py-2.5 italic" colSpan={4}>
                          Opening balance
                        </td>
                        <td className="px-5 py-2.5 text-right font-medium">
                          {formatCurrency(report.openingBalance)}
                        </td>
                      </tr>
                      {report.entries.map((e) => {
                        const isIncome = e.type === "INCOME";
                        return (
                          <tr key={e.id} className="text-gray-700">
                            <td className="whitespace-nowrap px-5 py-2.5">
                              {formatDate(e.date)}
                            </td>
                            <td className="px-5 py-2.5">{e.description || "—"}</td>
                            <td className="px-5 py-2.5">{e.categoryName}</td>
                            <td className="px-5 py-2.5 text-gray-500">{e.createdBy}</td>
                            <td
                              className={`whitespace-nowrap px-5 py-2.5 text-right font-semibold ${
                                isIncome ? "text-green-600" : "text-red-600"
                              }`}
                            >
                              {isIncome ? "+" : "-"} {formatCurrency(e.amount)}
                            </td>
                            <td className="whitespace-nowrap px-5 py-2.5 text-right">
                              {formatCurrency(e.balanceAfter)}
                            </td>
                          </tr>
                        );
                      })}
                      <tr className="font-semibold text-gray-800">
                        <td className="px-5 py-2.5">{formatDate(report.endDate)}</td>
                        <td className="px-5 py-2.5" colSpan={4}>
                          Closing balance
                        </td>
                        <td className="px-5 py-2.5 text-right">
                          {formatCurrency(report.closingBalance)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <p className="mt-3 text-xs text-gray-400">
              Generated at{" "}
              {new Date(report.generatedAt).toLocaleString("pt-BR")}
            </p>
          </>
        )
      )}
    </div>
  );
};

export default Reports;
