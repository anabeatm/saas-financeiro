import { createContext, useContext, useEffect, useRef } from "react";

export const RealtimeContext = createContext({
  status: "offline",
  subscribe: () => () => {},
  subscribeGamification: () => () => {},
});

// "connecting" | "live" | "offline"
export const useRealtimeStatus = () => useContext(RealtimeContext).status;

// Keeps the latest handler without re-subscribing on every render.
function useSubscription(subscribe, handler) {
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  });

  useEffect(() => subscribe((event) => handlerRef.current(event)), [subscribe]);
}

// Calls `handler` for every wallet event received while the component is mounted.
export function useWalletEvents(handler) {
  useSubscription(useContext(RealtimeContext).subscribe, handler);
}

// Calls `handler` for every progress event of the user (XP, level, achievements, budget alerts).
export function useGamificationEvents(handler) {
  useSubscription(useContext(RealtimeContext).subscribeGamification, handler);
}
