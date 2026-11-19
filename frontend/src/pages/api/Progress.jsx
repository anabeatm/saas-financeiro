import { Inbox, Lock } from "lucide-react";
import CheckInButton from "../../components/gamification/CheckInButton";
import {
  formatInstant,
  nextTier,
  XP_REASONS,
  XP_RULES,
} from "../../components/gamification/labels";
import LevelEmblem from "../../components/gamification/LevelEmblem";
import PixelSprite from "../../components/gamification/PixelSprite";
import { StreakInfo, XpBar } from "../../components/gamification/ProgressParts";
import { ACHIEVEMENT_SPRITES } from "../../components/gamification/sprites";
import useGamificationProfile from "../../components/gamification/useGamificationProfile";

// Level, streak, achievements, recent XP and the rules of the game.
const Progress = () => {
  const { profile, setProfile, loading, error } = useGamificationProfile();

  if (loading) {
    return (
      <div className="flex h-full min-h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#a88d6f] border-t-transparent"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div
        role="alert"
        className="mx-auto max-w-7xl rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
      >
        {error || "Your progress is not available right now."}
      </div>
    );
  }

  const tier = nextTier(profile.level);
  const unlockedCount = profile.achievements.filter((a) => a.unlocked).length;

  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Progress</h1>
        <p className="mt-1 text-sm text-gray-500">
          Good habits earn XP: logging regularly, staying within your budgets and saving part of
          your income.
        </p>
      </div>

      <section className="mb-8 grid grid-cols-1 gap-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm lg:grid-cols-3">
        <div className="flex items-center gap-5 lg:col-span-2">
          <LevelEmblem level={profile.level} title={profile.levelTitle} size={96} />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
              {profile.levelTitle}
            </p>
            <h2 className="mb-3 text-2xl font-bold text-gray-800">Level {profile.level}</h2>
            <XpBar profile={profile} />
            {tier && (
              <p className="mt-1 text-xs text-gray-400">
                Next title: <span className="font-semibold">{tier.title}</span> at level{" "}
                {tier.from}
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-col justify-center gap-4 border-t border-gray-100 pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
          <StreakInfo profile={profile} />
          <CheckInButton profile={profile} onCheckedIn={setProfile} />
        </div>
      </section>

      <section className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400">
            Achievements
          </h2>
          <span className="text-xs font-semibold text-gray-400">
            {unlockedCount} of {profile.achievements.length}
          </span>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {profile.achievements.map((achievement) => {
            const sprite = ACHIEVEMENT_SPRITES[achievement.code];
            return (
              <div
                key={achievement.code}
                className={`flex items-center gap-4 rounded-xl border p-4 shadow-sm ${
                  achievement.unlocked
                    ? "border-[#a88d6f]/40 bg-white"
                    : "border-gray-200 bg-gray-50"
                }`}
              >
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-[#a88d6f]/5">
                  {sprite && (
                    <PixelSprite
                      grid={sprite.grid}
                      palette={sprite.palette}
                      size={48}
                      muted={!achievement.unlocked}
                    />
                  )}
                </div>
                <div className="min-w-0">
                  <p
                    className={`text-sm font-bold ${achievement.unlocked ? "text-gray-800" : "text-gray-500"}`}
                  >
                    {achievement.title}
                  </p>
                  <p className="text-xs text-gray-500">{achievement.description}</p>
                  <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-gray-400">
                    {achievement.unlocked ? (
                      <>Unlocked on {formatInstant(achievement.unlockedAt)}</>
                    ) : (
                      <>
                        <Lock size={11} /> Locked
                      </>
                    )}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-gray-800">Recent XP</h2>
          {profile.recentXp.length === 0 ? (
            <div className="flex flex-col items-center py-6 text-gray-400">
              <Inbox size={32} className="mb-2 opacity-50" />
              <p className="text-sm">Log a transaction to earn your first XP.</p>
            </div>
          ) : (
            <ul className="flex flex-col divide-y divide-gray-100">
              {profile.recentXp.map((entry, i) => (
                <li key={i} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-gray-700">
                      {XP_REASONS[entry.type] ?? entry.type}
                    </p>
                    <p className="text-xs text-gray-400">{formatInstant(entry.createdAt)}</p>
                  </div>
                  <span className="shrink-0 font-bold text-[#a88d6f]">+{entry.xp} XP</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-1 text-lg font-bold text-gray-800">How to earn XP</h2>
          <p className="mb-4 text-xs text-gray-500">
            Months are rewarded when they end. Amounts are compared as percentages, so it is about
            habits, not income.
          </p>
          <ul className="flex flex-col divide-y divide-gray-100">
            {XP_RULES.map((rule) => (
              <li key={rule.action} className="flex items-start justify-between gap-4 py-2.5">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-700">{rule.action}</p>
                  <p className="text-xs text-gray-400">{rule.note}</p>
                </div>
                <span className="shrink-0 rounded bg-[#a88d6f]/10 px-2 py-0.5 text-xs font-bold text-[#a88d6f]">
                  {rule.xp}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
};

export default Progress;
