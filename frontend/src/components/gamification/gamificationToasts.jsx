import { XP_REASONS } from "./labels";
import LevelEmblem from "./LevelEmblem";
import PixelSprite from "./PixelSprite";
import { ACHIEVEMENT_SPRITES } from "./sprites";

// toast de evento de progresso
export const gamificationToast = (event) => {
  switch (event.type) {
    case "XP_GAINED":
      return {
        type: "reward",
        title: `+${event.xp} XP`,
        description: XP_REASONS[event.xpReason] ?? "Progress made",
        duration: 2500,
      };
    case "LEVEL_UP":
      return {
        type: "reward",
        title: `Level ${event.level} reached`,
        description: `Your title is now ${event.levelTitle}.`,
        icon: <LevelEmblem level={event.level} title={event.levelTitle} size={32} />,
        duration: 6000,
      };
    case "ACHIEVEMENT_UNLOCKED": {
      const sprite = ACHIEVEMENT_SPRITES[event.achievement];
      return {
        type: "reward",
        title: "Achievement unlocked",
        description: event.achievementTitle,
        icon: sprite && <PixelSprite grid={sprite.grid} palette={sprite.palette} size={32} />,
        duration: 6000,
      };
    }
    case "BUDGET_WARNING":
      return {
        type: "warning",
        title: "Budget almost reached",
        description: `${event.categoryName} is at ${event.percent}% of its monthly limit.`,
        duration: 6000,
      };
    case "BUDGET_EXCEEDED":
      return {
        type: "error",
        title: "Budget exceeded",
        description: `${event.categoryName} went over its monthly limit (${event.percent}%).`,
        duration: 6000,
      };
    default:
      return null;
  }
};
