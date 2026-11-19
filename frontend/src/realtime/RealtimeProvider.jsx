import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { gamificationToast } from "../components/gamification/gamificationToasts";
import { useToast } from "../components/useToast";
import { connectEventStream } from "./eventStream";
import { RealtimeContext } from "./useRealtime";
import { describeWalletEvent } from "./walletEvents";

// uma conexão em tempo real pro app todo: repassa os eventos pras páginas e mostra as notificações
export default function RealtimeProvider({ userId, children }) {
  const { addToast } = useToast();
  const [status, setStatus] = useState("connecting");
  const listeners = useRef(new Set());
  const gamificationListeners = useRef(new Set());
  const userIdRef = useRef(userId);

  useEffect(() => {
    userIdRef.current = userId;
  }, [userId]);

  useEffect(
    () =>
      connectEventStream({
        onStatus: setStatus,
        onEvent: (event) => {
          listeners.current.forEach((listener) => listener(event));
          // ignora o que o próprio usuário fez
          if (event.actorId !== userIdRef.current) {
            addToast({
              type: "info",
              title: "Live update",
              description: describeWalletEvent(event, userIdRef.current),
            });
          }
        },
        onGamificationEvent: (event) => {
          gamificationListeners.current.forEach((listener) => listener(event));
          const toast = gamificationToast(event);
          if (toast) addToast(toast);
        },
      }),
    [addToast],
  );

  const subscribe = useCallback((listener) => {
    listeners.current.add(listener);
    return () => listeners.current.delete(listener);
  }, []);

  const subscribeGamification = useCallback((listener) => {
    gamificationListeners.current.add(listener);
    return () => gamificationListeners.current.delete(listener);
  }, []);

  const value = useMemo(
    () => ({ status, subscribe, subscribeGamification }),
    [status, subscribe, subscribeGamification],
  );

  return (
    <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>
  );
}
