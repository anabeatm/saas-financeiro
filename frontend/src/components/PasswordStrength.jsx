export default function PasswordStrength({ password }) {
  if (!password || password.length === 0) return null;

  const evaluatePasswordStrength = (pass) => {
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.match(/(?=.*[a-z])(?=.*[A-Z])/)) score += 1;
    if (pass.match(/(?=.*\d)(?=.*[^A-Za-z0-9])/)) score += 1;

    switch (score) {
      case 1:
        return {
          score: 1,
          label: "Fraca",
          color: "bg-red-500",
          textColor: "text-red-500",
        };
      case 2:
        return {
          score: 2,
          label: "Média",
          color: "bg-yellow-500",
          textColor: "text-yellow-500",
        };
      case 3:
        return {
          score: 3,
          label: "Forte",
          color: "bg-green-500",
          textColor: "text-green-500",
        };
      default:
        return {
          score: 0,
          label: "Muito curta",
          color: "bg-red-500",
          textColor: "text-red-500",
        };
    }
  };

  const strength = evaluatePasswordStrength(password);

  return (
    <div className="flex flex-col gap-1 mt-1">
      <div className="flex justify-between items-center text-xs px-1">
        <span className="text-gray-500">Força da senha:</span>
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
