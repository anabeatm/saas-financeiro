import { CoinsIcon, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

function Login() {
  const [showPassword, setShowPassword] = useState(false);

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };
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
            <div className="flex flex-col gap-1">
              <label
                htmlFor="email"
                className="text-sm font-bold text-gray-700"
              >
                E-mail
              </label>
              <input
                type="email"
                id="email"
                placeholder="example@email.com"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label
                htmlFor="password"
                className="text-sm font-bold text-gray-700"
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="••••••••"
                  required
                  className="w-full pr-10 rounded-lg border border-gray-300 px-4 py-2 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="button"
                  onClick={toggleShowPassword}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-purple-600 focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
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

export default Login;
