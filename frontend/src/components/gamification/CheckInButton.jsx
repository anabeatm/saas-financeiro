import { CalendarCheck, Loader2, MoonStar } from "lucide-react";
import { useState } from "react";
import GamificationService from "../../../services/GamificationService";
import { useRealtimeStatus } from "../../realtime/useRealtime";
import { getErrorMessage } from "../../utils/errors";
import { useToast } from "../useToast";

// "I spent nothing today": keeps the streak without having to log an expense.
export default function CheckInButton({ profile, onCheckedIn, className = "" }) {
  const { addToast } = useToast();
  const realtime = useRealtimeStatus();
  const [busy, setBusy] = useState(false);

  const checkIn = async () => {
    setBusy(true);
    try {
      onCheckedIn(await new GamificationService().checkIn());
      // With the live connection the XP notification arrives by itself.
      if (realtime !== "live") {
        addToast({ type: "reward", title: "+5 XP", description: "No-spending day checked in" });
      }
    } catch (err) {
      addToast({
        type: "error",
        title: "Could not check in",
        description: getErrorMessage(err),
      });
    } finally {
      setBusy(false);
    }
  };

  if (profile.checkedInToday) {
    return (
      <span
        className={`flex items-center justify-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm font-semibold text-green-700 ${className}`}
      >
        <CalendarCheck size={16} />
        Checked in today
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={checkIn}
      disabled={busy}
      title="Check in a day without expenses to keep your streak"
      className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#a88d6f] px-4 py-2 text-sm font-semibold text-[#a88d6f] transition-colors hover:bg-[#a88d6f]/10 disabled:opacity-60 ${className}`}
    >
      {busy ? <Loader2 size={16} className="animate-spin" /> : <MoonStar size={16} />}
      No spending today
    </button>
  );
}
