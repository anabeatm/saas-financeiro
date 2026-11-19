import { useCallback, useEffect, useRef, useState } from "react";
import GamificationService from "../../../services/GamificationService";
import { useGamificationEvents, useWalletEvents } from "../../realtime/useRealtime";
import { getErrorMessage } from "../../utils/errors";

// espera a rajada de eventos acabar antes de recarregar
const RELOAD_DELAY_MS = 400;

// progresso do usuário, atualizado em tempo real
export default function useGamificationProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const timer = useRef(null);

  const reload = useCallback(async () => {
    try {
      setProfile(await new GamificationService().getMe());
      setError("");
    } catch (err) {
      setError(getErrorMessage(err, "Could not load your progress."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
    return () => clearTimeout(timer.current);
  }, [reload]);

  const scheduleReload = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(reload, RELOAD_DELAY_MS);
  };

  useGamificationEvents(scheduleReload);
  // recarrega quando muda transação também (apagar pode tirar xp)
  useWalletEvents((event) => {
    if (event.type === "TRANSACTION_DELETED") scheduleReload();
  });

  return { profile, setProfile, loading, error, reload };
}
