import PixelSprite from "./PixelSprite";
import { FLAME, SNOWFLAKE } from "./sprites";

const MAX_FREEZES = 2;

// barra de xp até o próximo nível
export function XpBar({ profile }) {
  const span = profile.nextLevelXp - profile.levelStartXp;
  const done = profile.xp - profile.levelStartXp;
  const pct = span > 0 ? Math.min(100, (done / span) * 100) : 100;

  return (
    <div className="w-full">
      <div
        className="h-3 w-full overflow-hidden rounded-sm border border-[#a88d6f]/40 bg-[#a88d6f]/10"
        role="progressbar"
        aria-valuemin={profile.levelStartXp}
        aria-valuemax={profile.nextLevelXp}
        aria-valuenow={profile.xp}
        aria-label="XP to the next level"
      >
        {/* preenchimento em degraus */}
        <div
          className="h-full bg-[repeating-linear-gradient(90deg,#a88d6f_0_6px,#91755a_6px_8px)] transition-[width] duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-1.5 text-xs text-gray-500">
        <span className="font-semibold text-gray-700">{profile.xp} XP</span>
        {" · "}
        {profile.nextLevelXp - profile.xp} XP to level {profile.level + 1}
      </p>
    </div>
  );
}

// info do streak
export function StreakInfo({ profile }) {
  const active = profile.currentStreak > 0;
  return (
    <div className="flex items-center gap-3">
      <PixelSprite
        grid={FLAME.grid}
        palette={FLAME.palette}
        size={36}
        muted={!active}
      />
      <div>
        <p className="text-lg font-bold leading-tight text-gray-800">
          {profile.currentStreak} {profile.currentStreak === 1 ? "day" : "days"}
        </p>
        <p className="text-xs text-gray-500">Best: {profile.bestStreak}</p>
        <div
          className="mt-1 flex items-center gap-1"
          title="Freezes: each one saves the streak on a missed day. You earn one every 7 days in a row."
        >
          {Array.from({ length: MAX_FREEZES }, (_, i) => (
            <PixelSprite
              key={i}
              grid={SNOWFLAKE.grid}
              palette={SNOWFLAKE.palette}
              size={14}
              muted={i >= profile.freezes}
            />
          ))}
          <span className="text-[11px] text-gray-400">
            {profile.freezes}/{MAX_FREEZES} freezes
          </span>
        </div>
      </div>
    </div>
  );
}
