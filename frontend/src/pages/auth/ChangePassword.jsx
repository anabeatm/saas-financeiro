import { useState } from "react";
import { useNavigate } from "react-router-dom";
import UserService from "../../../services/UserService";
import AuthLayout from "../../components/AuthLayout";
import Button from "../../components/Button";
import Input from "../../components/Input";
import PasswordStrength from "../../components/PasswordStrength";
import { useToast } from "../../components/ToastContext";

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();
  const { addToast } = useToast();
  const userService = new UserService();

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (currentPassword === newPassword) {
      addToast({
        type: "error",
        title: "Passwords cannot be the same",
        description:
          "A new password cannot be the same as the current password",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      addToast({
        type: "error",
        title: "Passwords don't match",
        description:
          "Make sure you enter the same password in both New Password and Confirm Password fields",
      });
      return;
    }

    try {
      await userService.changePassword(currentPassword, newPassword);

      addToast({
        type: "success",
        title: "Password changed!",
        description: "Your password has been successfully updated",
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        navigate("/app/dashboard");
      }, 2000);
    } catch (errorMessage) {
      addToast({
        type: "error",
        title: "Update failed",
        description:
          typeof errorMessage === "string"
            ? errorMessage
            : "We couldn't update your password at this time.",
      });
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
};

export default ChangePassword;
