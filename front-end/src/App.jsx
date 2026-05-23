import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
