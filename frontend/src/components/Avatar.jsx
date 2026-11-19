import { getInitials } from "../utils/format";

const SIZES = {
  sm: "h-8 w-8 text-xs",
  md: "h-9 w-9 text-sm",
  lg: "h-24 w-24 text-2xl",
};

// foto de perfil ou as iniciais
export default function Avatar({ user, size = "md" }) {
  const sizeClass = SIZES[size] ?? SIZES.md;

  if (user?.avatar) {
    return (
      <img
        src={user.avatar}
        alt={user.name ? `${user.name}'s profile picture` : "Profile picture"}
        className={`${sizeClass} shrink-0 rounded-full object-cover`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} flex shrink-0 items-center justify-center rounded-full bg-[#a88d6f] font-semibold text-white`}
    >
      {getInitials(user?.name)}
    </div>
  );
}
