import { CoinsIcon } from "lucide-react";

export default function AuthLayout({
  children,
  title,
  subtitle,
  showLogo = false,
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fbfaf9] p4 font-sans">
      <div className="w-full max-w-116">
        {showLogo && (
          <div className="mb-6 text-center">
            <CoinsIcon className="mx-auto mb-2 h-12 w-12 text-[#a88d6f]" />
            <h1 className="text-3xl font-extrabold text-[#a88d6f]">FinEXP</h1>
            <p className="mt-2 text-sm text-gray-500">
              Your finances in the gamification world
            </p>
          </div>
        )}

        <div className="w-full rounded-2xl bg-white p-8 shadow-xl">
          <div className="mb-6 text-center">
            <h2 className="text-xl font-bold text-[#0c0c0c]">{title}</h2>
            {subtitle && (
              <p className="mt-2 text-sm text-gray-500">{subtitle}</p>
            )}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
