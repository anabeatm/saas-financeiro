import {
  CoinsIcon,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Settings,
  Tags,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import UserService from "../../services/UserService";
import { getInitials } from "../utils/format";

const NAV_ITEMS = [
  { to: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/app/transactions", label: "Transactions", icon: CreditCard },
  { to: "/app/categories", label: "Categories", icon: Tags },
  { to: "/app/wallets", label: "Wallets", icon: Wallet },
  { to: "/app/profile/password", label: "Password", icon: Settings },
];

// Shell of the authenticated area: sidebar on desktop, top bar + bottom
// navigation on small screens. Pages are rendered through <Outlet /> and can
// read the logged user with useOutletContext().
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

  const initial = getInitials(user?.name);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col justify-between shrink-0">
        <div className="p-6">
          <div className="flex items-center gap-2 font-bold text-xl text-[#a88d6f] mb-8">
            <CoinsIcon className="h-6 w-6" />
            <span>FinEXP</span>
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
        </div>
        <div className="p-4 border-t border-gray-200 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="h-9 w-9 rounded-full bg-[#a88d6f] text-white flex items-center justify-center font-semibold text-sm shrink-0">
              {initial}
            </div>
            <p className="text-sm font-semibold text-gray-700 truncate">
              {user?.name}
            </p>
          </div>
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

      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden flex items-center justify-between bg-white border-b border-gray-200 px-4 py-3 shrink-0">
          <div className="flex items-center gap-2 font-bold text-lg text-[#a88d6f]">
            <CoinsIcon className="h-5 w-5" />
            <span>FinEXP</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-[#a88d6f] text-white flex items-center justify-center font-semibold text-xs">
              {initial}
            </div>
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

        <main className="flex-1 overflow-y-auto p-6 md:p-8 pb-24 md:pb-8">
          <Outlet context={{ user }} />
        </main>

        <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 flex justify-around py-2 z-10">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-0.5 px-2 py-1 text-[11px] font-medium ${
                    isActive ? "text-[#a88d6f]" : "text-gray-400"
                  }`
                }
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
