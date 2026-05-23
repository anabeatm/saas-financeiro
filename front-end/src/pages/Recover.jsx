import { Link } from "react-router-dom";
import Input from "../components/Input";
import { ArrowLeft } from "lucide-react";

export default function Recover() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fbfaf9] p-4 font-sans">
      <div className="w-full max-w-116 rounded-2xl bg-white p-8 shadow-xl ">
        <div className="mb-6 text-center">
          <h2 className="text-xl font-bold text-[#0c0c0c] text-center">
            Recover your password
          </h2>
          <p className="text-sm mt-2 text-gray-500">
            Inform your email to receive instructions
          </p>
        </div>

        <form className="flex flex-col gap-4">
          <Input
            label="E-mail"
            id="email"
            type="email"
            placeholder="example@email.com"
            required
          />
          <button
            type="submit"
            className="mt-4 w-full bg-[#a88d6f] text-white py-2 rounded-lg font-semibold hover:bg-[#d6bfa7] cursor-pointer"
          >
            Send
          </button>
          <div className="mt-2 flex justify-center gap-2 text-sm text-[#a88d6f] hover:text-[#d6bfa7] hover:underline">
            <Link to="/login" className="flex gap-1 items-center font-semibold">
              <ArrowLeft />
              Return to login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
