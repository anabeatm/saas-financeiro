import {
  CoinsIcon,
  CreditCard,
  FileText,
  LayoutDashboard,
  LogOut,
  Settings,
  Tags,
  Trophy,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import UserService from "../../services/UserService";
import InstallAppButton from "../pwa/InstallAppButton";
import LiveIndicator from "../realtime/LiveIndicator";
import RealtimeProvider from "../realtime/RealtimeProvider";
import Avatar from "./Avatar";

const NAV_ITEMS = [
  { to: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/app/transactions", label: "Transactions", icon: CreditCard },
  { to: "/app/categories", label: "Categories", icon: Tags },
  { to: "/app/wallets", label: "Wallets", icon: Wallet },
  { to: "/app/reports", label: "Reports", icon: FileText },
  { to: "/app/progress", label: "Progress", icon: Trophy },
  { to: "/app/profile", label: "Profile", icon: Settings },
];

// layout da área logada: sidebar no desktop, menu embaixo no celular
export default function AppLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    new UserService()
      .getMe()
      .then(setUser)
      .catch((err) => console.error("Error loading user profile", err));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <RealtimeProvider userId={user?.id}>
    <div className="flex h-screen bg-gray-50 overflow-hidden print:block print:h-auto print:overflow-visible print:bg-white">
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col justify-between shrink-0 print:hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2 font-bold text-xl text-[#a88d6f]">
              <CoinsIcon className="h-6 w-6" />
              <span>FinEXP</span>
            </div>
            <LiveIndicator />
          </div>
          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                      isActive
                        ? "bg-[#a88d6f]/10 text-[#a88d6f]"
                        : "text-gray-500 hover:bg-gray-50"
                    }`
                  }
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
          <div className="mt-4 border-t border-gray-100 pt-4">
            <InstallAppButton />
          </div>
        </div>
        <div className="p-4 border-t border-gray-200 flex items-center justify-between bg-gray-50/50">
          <NavLink
            to="/app/profile"
            title="Profile settings"
            className="flex items-center gap-3 overflow-hidden rounded-lg hover:opacity-80"
          >
            <Avatar user={user} size="md" />
            <p className="text-sm font-semibold text-gray-700 truncate">
              {user?.name}
            </p>
          </NavLink>
          <button
            onClick={handleLogout}
            className="text-gray-400 hover:text-red-500 p-1.5 cursor-pointer"
            title="Logout"
            aria-label="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 print:block">
        <header className="md:hidden flex items-center justify-between bg-white border-b border-gray-200 px-4 py-3 shrink-0 print:hidden">
          <div className="flex items-center gap-2 font-bold text-lg text-[#a88d6f]">
            <CoinsIcon className="h-5 w-5" />
            <span>FinEXP</span>
            <LiveIndicator compact />
          </div>
          <div className="flex items-center gap-3">
            <InstallAppButton compact />
            <NavLink
              to="/app/profile"
              title="Profile settings"
              aria-label="Profile settings"
            >
              <Avatar user={user} size="sm" />
            </NavLink>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-red-500 cursor-pointer"
              title="Logout"
              aria-label="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 md:p-8 pb-24 md:pb-8 print:overflow-visible print:p-0">
          <Outlet context={{ user, setUser }} />
        </main>

        <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 flex py-2 z-10 print:hidden">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex min-w-0 flex-1 flex-col items-center gap-0.5 px-1 py-1 text-[10px] font-medium ${
                    isActive ? "text-[#a88d6f]" : "text-gray-400"
                  }`
                }
              >
                <Icon size={20} />
                <span className="max-w-full truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
    </RealtimeProvider>
  );
}
