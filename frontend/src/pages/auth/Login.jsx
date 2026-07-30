import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../../configs/axiosConfig";
import AuthLayout from "../../components/AuthLayout";
import Button from "../../components/Button";
import Input from "../../components/Input";
import { useToast } from "../../components/ToastContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { addToast } = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();

    setIsLoading(true);

    try {
      const response = await api.post("/auth/login", {
        email: email,
        password: password,
      });

      localStorage.setItem("token", response.data.token);
      addToast({
        type: "success",
        title: "Login successful!",
      });

      setTimeout(() => {
        navigate("/app/dashboard");
      }, 1000);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        (typeof error === "string"
          ? error
          : "There was a problem connecting. Please try again");

      if (error.response?.status === 401) {
        addToast({
          type: "error",
          title: "Authentication failed",
          description: "Incorrect email or password",
        });
      } else {
        addToast({
          type: "error",
          title: "Validation Error",
          description: errorMessage,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Login" subtitle="Welcome back to FinEXP" showLogo={true}>
      <form noValidate onSubmit={handleLogin} className="flex flex-col gap-4">
        <Input
          label="E-mail"
          id="email"
          type="email"
          placeholder="example@email.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <div className="flex flex-col gap-1">
          <Input
            label="Password"
            id="password"
            type="password"
            placeholder="••••••••"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Link
            to="/recover"
            className="self-end text-xs font-bold text-[#a88d6f] hover:text-[#d6bfa7] hover:underline"
          >
            Forgot your password?
          </Link>
        </div>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              Entering... <Loader2 className="h-4" />
            </>
          ) : (
            <>Enter</>
          )}
        </Button>
        <div className="flex mt-2 text-sm gap-2 justify-center items-center">
          <p className="text-gray-500">Doesn't have an account?</p>
          <Link
            to="/register"
            className="font-semibold text-[#a88d6f] hover:text-[#d6bfa7] hover:underline"
          >
            Register right now
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Login;
