import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export default function Input({ label, id, type = "text", ...props }) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label htmlFor={id} className="text-sm font-semibold text-[#0c0c0c]">
          {label}
        </label>
      )}

      <div className="relative">
        <input
          id={id}
          type={isPassword && showPassword ? "text" : type}
          className={`w-full rounded-lg border border-gray-300 py-2 pl-4 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-purple-500 ${isPassword ? "pr-10" : "pr-4"}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-purple-600 focus:outline-none cursor-pointer"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
    </div>
  );
}
