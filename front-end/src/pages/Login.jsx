import { Link } from "react-router-dom";
import { CoinsIcon } from "lucide-react";
import Input from "../components/Input";
import Button from "../components/Button";
import AuthLayout from "../components/AuthLayout";

export default function Login() {
  return (
    <AuthLayout title="Login" subtitle="Welcome back to FinEXP" showLogo={true}>
      <form className="flex flex-col gap-4">
        <Input
          label="E-mail"
          id="email"
          type="email"
          placeholder="example@email.com"
          required
        />
        <div className="flex flex-col gap-1">
          <Input
            label="Password"
            id="password"
            type="password"
            placeholder="••••••••"
            required
          />
          <Link
            to="/recover"
            className="self-end text-xs font-bold text-[#a88d6f] hover:text-[#d6bfa7] hover:underline"
          >
            Forgot your password?
          </Link>
        </div>
        <Button type="submit">Enter</Button>
        <div className="flex mt-2 text-sm gap-2 justify-center items-center">
          <p className="text-gray-500">Doesn't have an account?</p>
          <Link
            to="/register"
            className="font-semibold text-[#a88d6f] hover:text-[#d6bfa7] hover:underline"
          >
            Register right now
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
