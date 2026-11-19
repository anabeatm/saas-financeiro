import { useCallback, useEffect, useRef, useState } from "react";
import GamificationService from "../../../services/GamificationService";
import { useGamificationEvents, useWalletEvents } from "../../realtime/useRealtime";
import { getErrorMessage } from "../../utils/errors";

// Events usually come in bursts (XP + level + achievement): reload once after they settle.
const RELOAD_DELAY_MS = 400;

// The user's progress, kept up to date with the real-time events.
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
  // Deleting a transaction can take XP back without a progress event.
  useWalletEvents((event) => {
    if (event.type === "TRANSACTION_DELETED") scheduleReload();
  });

  return { profile, setProfile, loading, error, reload };
}
