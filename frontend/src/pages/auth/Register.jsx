import { useState } from "react";
// import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/AuthLayout";
import Button from "../../components/Button";
import Input from "../../components/Input";
import PasswordStrength from "../../components/PasswordStrength";
import { useToast } from "../../components/ToastContext";

import authService from "../../../services/AuthService";

const Register = () => {
  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const navigate = useNavigate();
  const { addToast } = useToast();

  const handleRegister = async (e) => {
    e.preventDefault();

    {
      /*TODO: mostrar se senhas batem em tempo real */
    }
    if (user.password !== user.confirmPassword) {
      addToast({
        type: "error",
        title: "Passwords do not match",
        description: "Please make sure your passwords match",
      });
      return;
    }

    try {
      await authService.register(user);

      addToast({
        type: "success",
        title: "Registration successful!",
        description:
          "Please check your inbox to verify your account before logging in.",
      });

      setTimeout(() => {
        navigate("/login");
      }, 2500);
    } catch (errorMessage) {
      addToast({
        type: "error",
        title: "Validation Error",
        description:
          typeof errorMessage === "string" ? errorMessage : "Error registering",
      });
    }
  };

  const handleUser = (e) => {
    setUser({ ...user, [e.target.id]: e.target.value });
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join us and start your jouney"
      showLogo={true}
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
          value={user.name}
          onChange={handleUser}
        />
        <Input
          label="E-mail"
          id="email"
          type="email"
          placeholder="example@email.com"
          required
          value={user.email}
          onChange={handleUser}
        />
        <Input
          label="Password"
          id="password"
          type="password"
          placeholder="••••••••"
          required
          value={user.password}
          onChange={handleUser}
        />

        <PasswordStrength password={user.password} />

        <Input
          label="Confirm Password"
          id="confirmPassword"
          type="password"
          placeholder="••••••••"
          required
          value={user.confirmPassword}
          onChange={handleUser}
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
};

export default Register;
