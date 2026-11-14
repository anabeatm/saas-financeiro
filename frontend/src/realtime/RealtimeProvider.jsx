import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useToast } from "../components/useToast";
import { connectEventStream } from "./eventStream";
import { RealtimeContext } from "./useRealtime";
import { describeWalletEvent } from "./walletEvents";

// Keeps one real-time connection for the whole authenticated area, hands the events to the pages
// that subscribed (useWalletEvents) and notifies about changes made by other members.
export default function RealtimeProvider({ userId, children }) {
  const { addToast } = useToast();
  const [status, setStatus] = useState("connecting");
  const listeners = useRef(new Set());
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
          // Your own actions already show their feedback on the screen.
          if (event.actorId !== userIdRef.current) {
            addToast({
              type: "info",
              title: "Live update",
              description: describeWalletEvent(event, userIdRef.current),
            });
          }
        },
      }),
    [addToast],
  );

  const subscribe = useCallback((listener) => {
    listeners.current.add(listener);
    return () => listeners.current.delete(listener);
  }, []);

  const value = useMemo(() => ({ status, subscribe }), [status, subscribe]);

  return (
    <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>
  );
}
