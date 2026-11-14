import { useRealtimeStatus } from "./useRealtime";

const STATES = {
  live: { dot: "bg-green-500", label: "Live" },
  connecting: { dot: "bg-yellow-400 animate-pulse", label: "Connecting..." },
  offline: { dot: "bg-gray-300", label: "Offline" },
};

// Shows whether the real-time updates are working.
export default function LiveIndicator({ compact = false }) {
  const status = useRealtimeStatus();
  const state = STATES[status] ?? STATES.offline;

  return (
    <span
      role="status"
      title={`Real-time updates: ${state.label}`}
      className="flex items-center gap-1.5 text-xs font-medium text-gray-400"
    >
      <span className={`h-2 w-2 rounded-full ${state.dot}`} />
      {!compact && state.label}
    </span>
  );
}
