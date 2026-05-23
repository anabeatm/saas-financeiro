import { Link } from "react-router-dom";
import Input from "../components/Input";

export default function Register() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fbfaf9] p-4 font-sans">
      <div className="w-full max-w-116 rounded-2xl bg-white p-8 shadow-xl ">
        <div className="mb-6 text-center">
          <h2 className="text-xl font-bold text-[#0c0c0c] text-center">
            Create your account
          </h2>
          <p className="text-sm mt-2 text-gray-500">
            Join us and start your journey
          </p>
        </div>

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
          <button
            type="submit"
            className="mt-4 w-full bg-[#a88d6f] text-white py-2 rounded-lg font-semibold hover:bg-[#d6bfa7] cursor-pointer"
          >
            Register
          </button>
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
      </div>
    </div>
  );
}
