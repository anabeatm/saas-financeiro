import { createContext, useContext, useEffect, useRef } from "react";

export const RealtimeContext = createContext({
  status: "offline",
  subscribe: () => () => {},
});

// "connecting" | "live" | "offline"
export const useRealtimeStatus = () => useContext(RealtimeContext).status;

// Calls `handler` for every wallet event received while the component is mounted.
export function useWalletEvents(handler) {
  const { subscribe } = useContext(RealtimeContext);
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  });

  useEffect(() => subscribe((event) => handlerRef.current(event)), [subscribe]);
}
