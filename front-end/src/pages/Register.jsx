import { Link } from "react-router-dom";
import Input from "../components/Input";
import Button from "../components/Button";
import AuthLayout from "../components/AuthLayout";

export default function Register() {
  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join us and start your jouney"
    >
      <form className="flex flex-col gap-4">
        <Input
          label="Full Name"
          id="name"
          type="text"
          placeholder="Ana Beatriz"
          required
        />
        <Input
          label="E-mail"
          id="email"
          type="email"
          placeholder="example@email.com"
          required
        />
        <Input
          label="Password"
          id="password"
          type="password"
          placeholder="••••••••"
          required
        />
        <Input
          label="Confirm Password"
          id="confirm-password"
          type="password"
          placeholder="••••••••"
          required
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
