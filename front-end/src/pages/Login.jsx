import { CoinsIcon, Eye, EyeOff } from "lucide-react";
import Input from "../components/Input";

export default function Login() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-purple-50 p-4 font-sans">
      <div className="w-full max-w-116">
        <div className="mb-6 text-center">
          <CoinsIcon className="mx-auto mb-2 h-12 w-12 text-purple-600" />
          <h1 className="text-3xl font-extrabold text-purple-600 ">FinEXP</h1>
          <p className="mt-2 text-sm text-gray-500">
            Your finances in the gamification world
          </p>
        </div>

        <div className="w-full rounded-2xl bg-white p-8 shadow-xl">
          <div className="mb-6 text-center">
            <h2 className="text-xl font-semibold text-gray-800">Login</h2>
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
              <a
                href="#recover"
                className="self-end text-xs font-bold text-purple-600 hover:text-purple-700 hover:underline"
              >
                Forgot your password?
              </a>
            </div>
            <button
              type="submit"
              className="mt-4 w-full rounded-lg bg-purple-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 cursor-pointer"
            >
              Enter
            </button>
            <div className="flex mt-2 text-sm gap-2 justify-center items-center">
              <p className="text-gray-500">Doesn't have an account?</p>
              <a
                href="#register"
                className="font-semibold text-purple-500 hover:text-purple-700 hover:underline"
              >
                Register right now
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
