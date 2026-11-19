import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import CheckInButton from "./CheckInButton";
import LevelEmblem from "./LevelEmblem";
import { StreakInfo, XpBar } from "./ProgressParts";
import useGamificationProfile from "./useGamificationProfile";

// Dashboard summary of the user's progress: level, XP, streak and the daily check-in.
export default function ProgressCard() {
  const { profile, setProfile, loading, error } = useGamificationProfile();

  if (loading) {
    return (
      <section className="mb-6 h-28 animate-pulse rounded-xl border border-gray-200 bg-white shadow-sm" />
    );
  }

  if (error || !profile) {
    return (
      <section className="mb-6 rounded-xl border border-gray-200 bg-white p-5 text-sm text-gray-500 shadow-sm">
        {error || "Your progress is not available right now."}
      </section>
    );
  }

  return (
    <section
      aria-label="Your progress"
      className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <LevelEmblem level={profile.level} title={profile.levelTitle} size={56} />
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold text-gray-800">Level {profile.level}</h2>
              <span className="rounded bg-[#a88d6f]/10 px-2 py-0.5 text-xs font-semibold text-[#a88d6f]">
                {profile.levelTitle}
              </span>
            </div>
            <XpBar profile={profile} />
          </div>
        </div>

        <div className="hidden h-14 w-px bg-gray-100 lg:block" />

        <StreakInfo profile={profile} />

        <div className="hidden h-14 w-px bg-gray-100 lg:block" />

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center lg:flex-col lg:items-stretch">
          <CheckInButton profile={profile} onCheckedIn={setProfile} />
          <Link
            to="/app/progress"
            className="flex items-center justify-center gap-1 text-xs font-semibold text-[#a88d6f] hover:underline"
          >
            Achievements and rules
            <ChevronRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
