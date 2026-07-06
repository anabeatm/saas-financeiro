import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CreditCard,
  Tags,
  Settings,
  LogOut,
  CoinsIcon,
  DollarSign,
  ArrowUpCircle,
  ArrowDownCircle,
  Plus,
  Wallet,
} from "lucide-react";

import {
  ResponsiveContainer,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Area,
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
                  R${" "}
                  {entry.value.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
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

const Dashboard = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({ name: "", initial: "" });
  const [summary, setSummary] = useState({
    balance: 0,
    revenues: 0,
    expenses: 0,
  });
  const [chartData, setChartData] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [goalsSummary, setGoalsSummary] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 1200));

        setUserData({ name: "Ana Beatriz", initial: "AB" });
        setSummary({ balance: 5250.0, revenues: 8000.0, expenses: 2750.0 });
        setChartData([
          { name: "Jan", Revenues: 4000, Expenses: 2400 },
          { name: "Fev", Revenues: 4500, Expenses: 2100 },
          { name: "Mar", Revenues: 5100, Expenses: 2900 },
          { name: "Abr", Revenues: 6000, Expenses: 3000 },
          { name: "Mai", Revenues: 5500, Expenses: 2500 },
          { name: "Jun", Revenues: 8000, Expenses: 2750 },
        ]);

        setTransactions([
          {
            id: 1,
            description: "Salary",
            amount: 8000.0,
            date: "2026-06-05",
            type: "revenue",
          },
          {
            id: 2,
            description: "Rental",
            amount: 1500.0,
            date: "2026-06-10",
            type: "expense",
          },
          {
            id: 3,
            description: "Supermarket",
            amount: 650.0,
            date: "2026-06-12",
            type: "expense",
          },
          {
            id: 4,
            description: "Electricity Bill",
            amount: 350.0,
            date: "2026-06-14",
            type: "expense",
          },
          {
            id: 5,
            description: "Freelance Design",
            amount: 250.0,
            date: "2026-06-15",
            type: "revenue",
          },
        ]);
        setGoalsSummary([
          {
            id: 1,
            title: "Trip to Euro",
            current: 3500.0,
            target: 10000.0,
            type: "shared",
          },
          {
            id: 2,
            title: "Emergency Fund",
            current: 1200.0,
            target: 5000.0,
            type: "personal",
          },
        ]);
      } catch (err) {
        console.error("Erro", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#a88d6f] border-t-transparent"></div>
          <p className="text-gray-500 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col justify-between shrink-0">
        <div className="p-6">
          <div className="flex items-center gap-2 font-bold text-xl text-[#a88d6f] mb-8">
            <CoinsIcon className="h-6 w-6" />
            <span>FinEXP</span>
          </div>
          <nav className="flex flex-col gap-1">
            <a
              href="/app/dashboard"
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-[#a88d6f]/10 text-[#a88d6f] font-medium text-sm"
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </a>
            <a
              href="/app/transactions"
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-500 hover:bg-gray-50 font-medium text-sm transition-colors"
            >
              <CreditCard size={18} />
              <span>Transactions</span>
            </a>
            <a
              href="/app/categories"
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-500 hover:bg-gray-50 font-medium text-sm transition-colors"
            >
              <Tags size={18} />
              <span>Categories</span>
            </a>
            <a
              href="/app/wallets"
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-500 hover:bg-gray-50 font-medium text-sm transition-colors"
            >
              <Wallet size={18} />
              <span>Wallets</span>
            </a>

            {/* TODO: mudar isso daqui, quero que seja possível alterar o perfil inteiro não só a senha */}
            {/* TODO: refatorar toda a tela de mudar a senha, não seguiu um layout legal */}
            <a
              href="/app/profile/password"
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-500 hover:bg-gray-50 font-medium text-sm transition-colors"
            >
              <Settings size={18} />
              <span>Change Password</span>
            </a>
          </nav>
        </div>
        <div className="p-4 border-t border-gray-200 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="h-9 w-9 rounded-full bg-[#a88d6f] text-white flex items-center justify-center font-semibold text-sm shrink-0">
              {userData.initial}
            </div>
            <div className="truncate">
              <p className="text-sm font-semibold text-gray-700 truncate">
                {userData.name}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="text-gray-400 hover:text-red-500 p-1.5"
            title="Logout"
          >
            <LogOut size={18} className="cursor-pointer" />
          </button>
        </div>
      </aside>
      <main className="flex-1 flex flex-col h-full overflow-y-auto p-6 md:p-8">
        <div className="max-w-7xl w-full mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Hello, {userData.name}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Here is a summary of your financial health
              </p>
            </div>

            {/* TODO: fazer modal de novo lançamento */}
            <button className="flex items-center justify-center gap-2 bg-[#a88d6f] hover:bg-[#91755a] text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-colors shadow-sm cursor-pointer">
              <Plus size={18} />
              <span className="font-semibold">New Transaction</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  Current Balance
                </p>
                <h3 className="text-2xl font-bold text-gray-800">
                  R${" "}
                  {summary.balance.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </h3>
              </div>
              <div className="p-3 bg-[#a88d6f]/10 text-[#a88d6f] rounded-lg">
                <DollarSign size={24} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  Total Revenue
                </p>
                <h3 className="text-2xl font-bold text-green-600">
                  R${" "}
                  {summary.revenues.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </h3>
              </div>
              <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                <ArrowUpCircle size={24} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  Total Expenses
                </p>
                <h3 className="text-2xl font-bold text-red-600">
                  R${" "}
                  {summary.expenses.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
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
                Financial Evolution
              </h2>

              <div className="h-72 w-full">
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
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold text-gray-800">My Goals</h2>
                  <a
                    href="/app/wallets"
                    className="text-xs font-semibold text-[#a88d6f] hover:underline"
                  >
                    View all
                  </a>
                </div>

                <div className="flex flex-col gap-4">
                  {goalsSummary.map((goal) => {
                    const pct = Math.min(
                      (goal.current / goal.target) * 100,
                      100,
                    );
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
                  })}
                </div>
              </div>

              {/* Lançamentos Recentes (Ficou embaixo do resumo das caixinhas para organizar o espaço) */}
              <div className="mt-6 border-t border-gray-100 pt-4">
                <h4 className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">
                  Recent Releases
                </h4>
                <div className="flex flex-col gap-2">
                  {transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex justify-between items-center text-xs"
                    >
                      <span className="text-gray-600 truncate max-w-30">
                        {tx.description}
                      </span>
                      <span
                        className={`font-bold ${tx.type === "revenue" ? "text-green-600" : "text-red-600"}`}
                      >
                        {tx.type === "revenue" ? "+" : "-"} R${" "}
                        {tx.amount.toFixed(0)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;