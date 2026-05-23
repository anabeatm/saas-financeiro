import { Link } from "react-router-dom";
import { CoinsIcon } from "lucide-react";
import Input from "../components/Input";

export default function Login() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fbfaf9] p-4 font-sans">
      <div className="w-full max-w-116">
        <div className="mb-6 text-center">
          <CoinsIcon className="mx-auto mb-2 h-12 w-12 text-[#a88d6f]" />
          <h1 className="text-3xl font-extrabold text-[#a88d6f] ">FinEXP</h1>
          <p className="mt-2 text-sm text-gray-500">
            Your finances in the gamification world
          </p>
        </div>

        <div className="w-full rounded-2xl bg-white p-8 shadow-xl">
          <div className="mb-6 text-center">
            <h2 className="text-xl font-bold text-[#0c0c0c]">Login</h2>
            <p className="text-sm text-gray-500 mt-2">Welcome back to FinEXP</p>
          </div>

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
            <button
              type="submit"
              className="mt-4 w-full rounded-lg bg-[#a88d6f] px-4 py-2 font-semibold text-white transition-colors hover:bg-[#d6bfa7] focus:outline-none focus:ring-2 focus:ring-[#cb9d6c] focus:ring-offset-2 cursor-pointer"
            >
              Enter
            </button>
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
        </div>
      </div>
    </div>
  );
}
