import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { CoinsIcon, Loader2 } from "lucide-react";
import Input from "../../components/Input";
import Button from "../../components/Button";
import AuthLayout from "../../components/AuthLayout";
import { useToast } from "../../components/ToastContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const isBlankField = email.trim() == "" || password.trim() == "";
  const navigate = useNavigate();
  const { addToast } = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();

    const form = e.target;

    if (isBlankField) {
      addToast({
        type: "error",
        title: "Required fields",
        description: "Please, fill in all fields to continue",
      });
      return;
    }

    if (!form.email.validity.valid) {
      addToast({
        type: "error",
        title: "Invalid email",
        description: "Please enter a valid format (e.g., your@email.com)",
      });
      return;
    }

    if (password.length < 6) {
      addToast({
        type: "error",
        title: "Invalid password",
        description: "The password must be at least 6 characters long",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post("/auth/login", {
        email: email,
        password: password,
      });

      localStorage.setItem("token", response.data.token);
      addToast({
        type: "success",
        title: "Login successful!",
      });

      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        addToast({
          type: "error",
          title: "Authentication failed",
          description: "Incorrect email or password",
        });
      } else {
        addToast({
          type: "error",
          title: "Error logging in",
          description: "There was a problem connecting. Please try again",
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
}

export default Login;