import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import Input from "../components/Input";
import Button from "../components/Button";
import AuthLayout from "../components/AuthLayout";
import { useToast } from "../components/ToastContext";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const isBlankField =
    name.trim() == "" || email.trim() == "" || password.trim() == "";
  const navigate = useNavigate();
  const { addToast } = useToast();

  const handleRegister = async (e) => {
    e.preventDefault();

    const form = e.target;

    if (isBlankField) {
      addToast({
        type: "error",
        title: "Required fields",
        description:
          "Please, fill in your name, email and password to continue",
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

    // setIsLoading(true);

    try {
      const response = await axios.post("/auth/register", {
        name: name,
        email: email,
        password: password,
      });

      localStorage.setItem("token", response.data.token);
      addToast({
        type: "success",
        title: "Register successful!",
      });

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        addToast({
          type: "error",
          title: "Authentication failed",
          description: "Incorrect email or password",
        });
      } else {
        addToast({
          type: "error",
          title: "Error register in",
          description: "There was a problem connecting. Please try again",
        });
      }
    } finally {
      // setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join us and start your jouney"
    >
      <form
        noValidate
        onSubmit={handleRegister}
        className="flex flex-col gap-4"
      >
        <Input
          label="Full Name"
          id="name"
          type="text"
          placeholder="Ana Beatriz"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          label="E-mail"
          id="email"
          type="email"
          placeholder="example@email.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          label="Password"
          id="password"
          type="password"
          placeholder="••••••••"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Input
          label="Confirm Password"
          id="confirm-password"
          type="password"
          placeholder="••••••••"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <Button type="submit">Register</Button>

        <div className="mt-2 flex items-center justify-center gap-2 text-sm">
          <p className="text-gray-500">Already have an account?</p>
          <Link
            to="/login"
            className="font-semibold text-[#a88d6f] hover:text-[#d6bfa7] hover:underline"
          >
            Login here
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
