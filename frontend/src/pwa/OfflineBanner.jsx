import { WifiOff } from "lucide-react";
import { useOnline } from "./usePwa";

// aviso de offline
export default function OfflineBanner() {
  const online = useOnline();
  if (online) return null;

  return (
    <div
      role="status"
      className="fixed inset-x-0 top-0 z-50 flex items-center justify-center gap-2 bg-gray-800 px-4 py-2 text-center text-sm text-white print:hidden"
    >
      <WifiOff size={16} className="shrink-0" />
      You are offline. The app works, but your data will load again when you reconnect.
    </div>
  );
}
