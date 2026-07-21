import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AuthLayout from "../../components/AuthLayout";
import Button from "../../components/Button";
import Input from "../../components/Input";
import PasswordStrength from "../../components/PasswordStrength";
import { useToast } from "../../components/ToastContext";
import authService from "../../services/AuthService";

const ResetPassword = () => {
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
      return;
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
      await authService.resetPassword(token, password);
      addToast({
        type: "success",
        title: "Password changed!",
        description:
          "Your password has been successfully updated. Please log in to continue",
      });

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (errorMessage) {
      addToast({
        type: "error",
        title: "Reset failed",
        description:
          typeof errorMessage === "string"
            ? errorMessage
            : "The recovery link is invalid or has expired.",
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
};

export default ResetPassword;
