import { createContext, useContext, useEffect, useRef } from "react";

export const RealtimeContext = createContext({
  status: "offline",
  subscribe: () => () => {},
  subscribeGamification: () => () => {},
});

// "connecting" | "live" | "offline"
export const useRealtimeStatus = () => useContext(RealtimeContext).status;

// guarda o handler mais recente
function useSubscription(subscribe, handler) {
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  });

  useEffect(() => subscribe((event) => handlerRef.current(event)), [subscribe]);
}

// escuta eventos de carteira
export function useWalletEvents(handler) {
  useSubscription(useContext(RealtimeContext).subscribe, handler);
}

// escuta eventos de progresso
export function useGamificationEvents(handler) {
  useSubscription(useContext(RealtimeContext).subscribeGamification, handler);
}
