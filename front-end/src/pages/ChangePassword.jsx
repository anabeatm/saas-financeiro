import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import Input from "../components/Input";
import Button from "../components/Button";
import { useToast } from "../components/ToastContext";
import PasswordStrength from "../components/PasswordStrength";

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();
  const { addToast } = useToast();
  const isBlankField =
    currentPassword.trim() == "" ||
    newPassword.trim() == "" ||
    confirmPassword.trim() == "";

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (isBlankField) {
      addToast({
        type: "error",
        title: "Required fields",
        description: "Please, fill in all fields to continue",
      });
      return;
    }

    if (newPassword.length < 6) {
      addToast({
        type: "error",
        title: "Weak password",
        description: "The password must be at least 6 characters long",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      addToast({
        type: "error",
        title: "Passwords don't match.",
        description: "Make sure you enter the same password in both fields",
      });
      return;
    }

    try {
      await axios.post("/auth/profile/password", {
        currentPassword: currentPassword,
        newPassword: newPassword,
      });
      addToast({
        type: "success",
        title: "Password changed!",
        description: "Your password has been successfully updated",
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        addToast({
          type: "error",
          title: "Incorrect current password",
          description: "The current password you entered is wrong. Try again.",
        });
      } else {
        addToast({
          type: "error",
          title: "Update failed",
          description: "We couldn't update your password at this time.",
        });
      }
    }
  };

  return (
    <AuthLayout
      title="Change your password"
      subtitle="Enter your current password and set a new one"
      showLogo={true}
    >
      <form
        noValidate
        onSubmit={handleChangePassword}
        className="flex flex-col gap-4"
      >
        <Input
          label="Current Password"
          id="current-password"
          type="password"
          placeholder="••••••••"
          required
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />

        <div className="flex flex-col gap-1">
          <Input
            label="New Password"
            id="new-password"
            type="password"
            placeholder="••••••••"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <PasswordStrength password={newPassword} />
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

        <Button type="submit">Update password</Button>
      </form>
    </AuthLayout>
  );
}
