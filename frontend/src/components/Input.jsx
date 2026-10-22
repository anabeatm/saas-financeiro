import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export default function Input({ label, id, type = "text", error, ...props }) {
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
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`w-full rounded-lg border py-2 pl-4 outline-none transition-all focus:border-transparent focus:ring-2 ${error ? "border-red-500 focus:ring-red-300" : "border-gray-300 focus:ring-[#cb9d6c]"} ${isPassword ? "pr-10" : "pr-4"}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-[#a88d6f] focus:outline-none cursor-pointer"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>

      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
