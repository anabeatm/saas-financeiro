import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/AuthLayout";
import Button from "../../components/Button";
import Input from "../../components/Input";
import PasswordStrength from "../../components/PasswordStrength";
import { useToast } from "../../components/useToast";
import {
  validateNewPassword,
  validatePasswordConfirmation,
} from "../../utils/password";
import { validateEmail, validateFullName } from "../../utils/validators";

import authService from "../../../services/AuthService";

const Register = () => {
  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { addToast } = useToast();

  // Every rule of the form, evaluated against the values being passed in.
  const validate = (values) => ({
    name: validateFullName(values.name),
    email: validateEmail(values.email),
    password: validateNewPassword(values.password),
    confirmPassword: validatePasswordConfirmation(
      values.password,
      values.confirmPassword,
    ),
  });

  const validateField = (field, values) =>
    setErrors((prev) => ({ ...prev, [field]: validate(values)[field] }));

  const handleRegister = async (e) => {
    e.preventDefault();

    const nextErrors = validate(user);
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    setIsLoading(true);
    try {
      await authService.register({
        name: user.name.trim(),
        email: user.email.trim(),
        password: user.password,
      });

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
      const message =
        typeof errorMessage === "string" ? errorMessage : "Error registering";

      // The "e-mail already registered" answer belongs to the e-mail field; nothing is cleared.
      if (/e-?mail/i.test(message)) {
        setErrors((prev) => ({ ...prev, email: message }));
      } else {
        addToast({
          type: "error",
          title: "Registration failed",
          description: message,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUser = (e) => {
    const field = e.target.id;
    const values = { ...user, [field]: e.target.value };
    setUser(values);

    // Fields that already show an error are re-checked while the user fixes them.
    if (errors[field]) validateField(field, values);
    if (field === "password" && errors.confirmPassword) {
      validateField("confirmPassword", values);
    }
  };

  const handleBlur = (e) => validateField(e.target.id, user);

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join us and start your journey"
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
          error={errors.name}
          onChange={handleUser}
          onBlur={handleBlur}
        />
        <Input
          label="E-mail"
          id="email"
          type="email"
          placeholder="example@email.com"
          required
          value={user.email}
          error={errors.email}
          onChange={handleUser}
          onBlur={handleBlur}
        />
        <div className="flex flex-col gap-1">
          <Input
            label="Password"
            id="password"
            type="password"
            placeholder="••••••••"
            required
            value={user.password}
            error={errors.password}
            onChange={handleUser}
            onBlur={handleBlur}
          />
          <PasswordStrength password={user.password} />
        </div>

        <Input
          label="Confirm Password"
          id="confirmPassword"
          type="password"
          placeholder="••••••••"
          required
          value={user.confirmPassword}
          error={errors.confirmPassword}
          onChange={handleUser}
          onBlur={handleBlur}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              Creating account... <Loader2 className="h-4 animate-spin" />
            </>
          ) : (
            <>Register</>
          )}
        </Button>

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
