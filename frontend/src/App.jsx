import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import AppLayout from "./components/AppLayout";
import Dashboard from "./pages/api/Dashboard";
import Transactions from "./pages/api/Transactions";
import Wallets from "./pages/api/Wallets";
import ChangePassword from "./pages/auth/ChangePassword";
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

const changePasswordRoute = (path) => ({
  path,
  element: (
    <ProtectedRoute>
      <ChangePassword />
    </ProtectedRoute>
  ),
});

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

  changePasswordRoute("/app/profile/password"),
  changePasswordRoute("/app/perfil/senha"),

  {
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: "/app/dashboard", element: <Dashboard /> },
      { path: "/app/transactions", element: <Transactions /> },
      { path: "/app/wallets", element: <Wallets /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
