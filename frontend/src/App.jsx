import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import AppLayout from "./components/AppLayout";
import Categories from "./pages/api/Categories";
import Dashboard from "./pages/api/Dashboard";
import Transactions from "./pages/api/Transactions";
import Reports from "./pages/api/Reports";
import Profile from "./pages/api/Profile";
import Wallets from "./pages/api/Wallets";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Login from "./pages/auth/Login";
import Recover from "./pages/auth/Recover";
import Register from "./pages/auth/Register";
import VerifyAccount from "./pages/auth/VerifyAccount";

// Only authenticated users can see the app area.
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Login/registration pages send an already authenticated user to the dashboard.
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (token) {
    return <Navigate to="/app/dashboard" replace />;
  }
  return children;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/login",
    element: (
      <PublicRoute>
        <Login />
      </PublicRoute>
    ),
  },
  {
    path: "/register",
    element: (
      <PublicRoute>
        <Register />
      </PublicRoute>
    ),
  },
  {
    path: "/verify-account/:token",
    element: <VerifyAccount />,
  },
  {
    path: "/recover",
    element: (
      <PublicRoute>
        <Recover />
      </PublicRoute>
    ),
  },

  { path: "/forgot-password/:token", element: <ForgotPassword /> },

  // Portuguese aliases for the routes named in the assignment.
  { path: "/recuperar-senha", element: <Navigate to="/recover" replace /> },
  { path: "/redefinir-senha/:token", element: <ForgotPassword /> },

  // Portuguese aliases for the profile/password routes named in the assignment.
  { path: "/app/perfil", element: <Navigate to="/app/profile" replace /> },
  {
    path: "/app/perfil/senha",
    element: <Navigate to="/app/profile/password" replace />,
  },

  {
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: "/app/dashboard", element: <Dashboard /> },
      { path: "/app/transactions", element: <Transactions /> },
      { path: "/app/categories", element: <Categories /> },
      { path: "/app/wallets", element: <Wallets /> },
      { path: "/app/reports", element: <Reports /> },
      { path: "/app/profile", element: <Profile /> },
      { path: "/app/profile/password", element: <Profile /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
