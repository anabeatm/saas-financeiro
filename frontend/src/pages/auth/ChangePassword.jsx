import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import UserService from "../../../services/UserService";
import AuthLayout from "../../components/AuthLayout";
import Button from "../../components/Button";
import Input from "../../components/Input";
import PasswordStrength from "../../components/PasswordStrength";
import { useToast } from "../../components/useToast";
import {
  validateNewPassword,
  validatePasswordConfirmation,
} from "../../utils/password";
import { validateRequired } from "../../utils/validators";

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { addToast } = useToast();

  const setError = (field, message) =>
    setErrors((prev) => ({ ...prev, [field]: message }));

  // The new password must be valid and different from the current one.
  const checkNewPassword = (value, current = currentPassword) => {
    const error = validateNewPassword(value);
    if (error) return error;
    return value === current
      ? "The new password must be different from the current one"
      : "";
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    const nextErrors = {
      currentPassword: validateRequired(currentPassword),
      newPassword: checkNewPassword(newPassword),
      confirmPassword: validatePasswordConfirmation(
        newPassword,
        confirmPassword,
      ),
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    setIsLoading(true);
    try {
      await new UserService().changePassword(currentPassword, newPassword);

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
      const message =
        typeof errorMessage === "string"
          ? errorMessage
          : "We couldn't update your password at this time.";

      // A wrong current password is reported on that field.
      if (/current password/i.test(message)) {
        setError("currentPassword", message);
      } else {
        addToast({ type: "error", title: "Update failed", description: message });
      }
    } finally {
      setIsLoading(false);
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
          error={errors.currentPassword}
          onChange={(e) => {
            setCurrentPassword(e.target.value);
            if (errors.currentPassword) {
              setError("currentPassword", validateRequired(e.target.value));
            }
          }}
          onBlur={(e) => setError("currentPassword", validateRequired(e.target.value))}
        />

        <div className="flex flex-col gap-1">
          <Input
            label="New Password"
            id="new-password"
            type="password"
            placeholder="••••••••"
            required
            value={newPassword}
            error={errors.newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              if (errors.newPassword) {
                setError("newPassword", checkNewPassword(e.target.value));
              }
              if (errors.confirmPassword) {
                setError(
                  "confirmPassword",
                  validatePasswordConfirmation(e.target.value, confirmPassword),
                );
              }
            }}
            onBlur={(e) => setError("newPassword", checkNewPassword(e.target.value))}
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
          error={errors.confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            if (errors.confirmPassword) {
              setError(
                "confirmPassword",
                validatePasswordConfirmation(newPassword, e.target.value),
              );
            }
          }}
          onBlur={(e) =>
            setError(
              "confirmPassword",
              validatePasswordConfirmation(newPassword, e.target.value),
            )
          }
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              Updating... <Loader2 className="h-4 animate-spin" />
            </>
          ) : (
            <>Update password</>
          )}
        </Button>
      </form>
    </AuthLayout>
  );
};

export default ChangePassword;
