import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import authService from "../../../services/AuthService";
import AuthLayout from "../../components/AuthLayout";
import Button from "../../components/Button";
import Input from "../../components/Input";
import PasswordStrength from "../../components/PasswordStrength";
import { useToast } from "../../components/useToast";
import {
  validateNewPassword,
  validatePasswordConfirmation,
} from "../../utils/password";

// Second step of the password recovery: the token comes from the link sent by e-mail.
const ResetPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [tokenError, setTokenError] = useState("");
  const navigate = useNavigate();
  const { addToast } = useToast();

  const checkPassword = (value) =>
    setErrors((prev) => ({ ...prev, password: validateNewPassword(value) }));

  const checkConfirmation = (pass, confirmation) =>
    setErrors((prev) => ({
      ...prev,
      confirmPassword: validatePasswordConfirmation(pass, confirmation),
    }));

  const handleReset = async (e) => {
    e.preventDefault();

    if (!token) {
      setTokenError("The recovery link is missing or incomplete.");
      return;
    }

    const nextErrors = {
      password: validateNewPassword(password),
      confirmPassword: validatePasswordConfirmation(password, confirmPassword),
    };
    setErrors(nextErrors);
    if (nextErrors.password || nextErrors.confirmPassword) return;

    setIsLoading(true);
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
      // Invalid, expired or already used token.
      setTokenError(
        typeof errorMessage === "string"
          ? errorMessage
          : "The recovery link is invalid or has expired.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Set a new password"
      subtitle="Type and confirm your new password below"
      showLogo={true}
    >
      <form noValidate onSubmit={handleReset} className="flex flex-col gap-4">
        {(tokenError || !token) && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {tokenError || "The recovery link is missing or incomplete."}{" "}
            <Link to="/recover" className="font-semibold underline">
              Request a new link
            </Link>
          </div>
        )}

        <div className="flex flex-col gap-1">
          <Input
            label="New Password"
            id="password"
            type="password"
            placeholder="••••••••"
            required
            value={password}
            error={errors.password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) checkPassword(e.target.value);
              if (errors.confirmPassword) {
                checkConfirmation(e.target.value, confirmPassword);
              }
            }}
            onBlur={(e) => checkPassword(e.target.value)}
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
          error={errors.confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            if (errors.confirmPassword) {
              checkConfirmation(password, e.target.value);
            }
          }}
          onBlur={(e) => checkConfirmation(password, e.target.value)}
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              Saving... <Loader2 className="h-4 animate-spin" />
            </>
          ) : (
            <>Save new password</>
          )}
        </Button>
      </form>
    </AuthLayout>
  );
};

export default ResetPassword;
