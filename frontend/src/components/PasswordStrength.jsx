import { getPasswordScore } from "../utils/password";

const LEVELS = [
  { score: 0, label: "Too short", color: "bg-red-500", textColor: "text-red-500" },
  { score: 1, label: "Weak", color: "bg-red-500", textColor: "text-red-500" },
  {
    score: 2,
    label: "Medium",
    color: "bg-yellow-500",
    textColor: "text-yellow-500",
  },
  {
    score: 3,
    label: "Strong",
    color: "bg-green-500",
    textColor: "text-green-500",
  },
];

const describeStrength = (score) => LEVELS[score];

export default function PasswordStrength({ password }) {
  if (!password || password.length === 0) return null;

  const strength = describeStrength(getPasswordScore(password));

  return (
    <div className="flex flex-col gap-1 mt-1">
      <div className="flex justify-between items-center text-xs px-1">
        <span className="text-gray-500">Password strength:</span>
        <span className={`font-semibold ${strength.textColor}`}>
          {strength.label}
        </span>
      </div>
      <div className="flex gap-1 h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full w-1/3 transition-colors duration-300 ${strength.score >= 1 ? strength.color : "bg-transparent"}`}
        ></div>
        <div
          className={`h-full w-1/3 transition-colors duration-300 ${strength.score >= 2 ? strength.color : "bg-transparent"}`}
        ></div>
        <div
          className={`h-full w-1/3 transition-colors duration-300 ${strength.score >= 3 ? strength.color : "bg-transparent"}`}
        ></div>
      </div>
    </div>
  );
}
