import PixelSprite from "./PixelSprite";
import { levelCoin, TIER_PALETTES } from "./sprites";

// The level as a pixel coin; its metal shows the title tier.
export default function LevelEmblem({ level, title, size = 64 }) {
  return (
    <PixelSprite
      grid={levelCoin(level)}
      palette={TIER_PALETTES[title] ?? TIER_PALETTES.Beginner}
      size={size}
      title={`Level ${level}, ${title}`}
    />
  );
}
