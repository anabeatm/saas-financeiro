import { Download } from "lucide-react";
import { promptInstall } from "./pwa";
import { useCanInstall } from "./usePwa";

// Shown only when the browser offers installation (Chrome/Edge on desktop and Android).
export default function InstallAppButton({ compact = false }) {
  const canInstall = useCanInstall();
  if (!canInstall) return null;

  return (
    <button
      type="button"
      onClick={promptInstall}
      title="Install FinEXP on this device"
      aria-label="Install app"
      className={
        compact
          ? "cursor-pointer text-gray-400 hover:text-[#a88d6f]"
          : "flex w-full cursor-pointer items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-[#a88d6f] transition-colors hover:bg-[#a88d6f]/10"
      }
    >
      <Download size={18} />
      {!compact && <span>Install app</span>}
    </button>
  );
}
