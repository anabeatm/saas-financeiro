import { useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import Input from "../components/Input";
import Button from "../components/Button";
import { useToast } from "../components/ToastContext";
import PasswordStrength from "../components/PasswordStrength";

export default function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();
  const { addToast } = useToast();
  const isBlankField = password.trim() == "" || confirmPassword.trim() == "";

  const handleReset = async (e) => {
    e.preventDefault();

    if (!token) {
      addToast({
        type: "error",
        title: "Invalid link",
        description: "The recovery link is missing or incomplete",
      });
    }

    if (isBlankField) {
      addToast({
        type: "error",
        title: "Required fields",
        description: "Please, fill in all fields to continue",
      });
      return;
    }

    if (password.length < 6) {
      addToast({
        type: "error",
        title: "Weak password",
        description: "The password must be at least 6 characters long",
      });
      return;
    }

    if (password !== confirmPassword) {
      addToast({
        type: "error",
        title: "Passwords don't match.",
        description: "Make sure you enter the same password in both fields",
      });
      return;
    }

    try {
      await axios.post("auth/reset-password", {
        token: token,
        newPassword: password,
      });
      addToast({
        type: "success",
        title: "Password changed!",
        description:
          "Your password has been successfully updated. Please log in to continue",
      });
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      addToast({
        type: "error",
        title: "Reset failed.",
        description:
          "The recovery link is invalid or has expired. Please request a new one",
      });
    }
  };

  return (
    <AuthLayout
      title="Set a new password"
      subtitle="Type and confirm your new password below"
      showLogo={true}
    >
      <form noValidate onSubmit={handleReset} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <Input
            label="New Password"
            id="password"
            type="password"
            placeholder="••••••••"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <PasswordStrength password={password} />
        </div>

        <Input
          label="Confirm New Password"
          id="confirm-password"
          type="password"
          placeholder="••••••••"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <Button type="submit">Save new password</Button>
      </form>
    </AuthLayout>
  );
}
