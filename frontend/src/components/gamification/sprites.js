// Pixel-art sprites of the gamification. Each sprite is a grid of characters (one per pixel,
// "." = transparent) and a palette mapping the characters to colors, drawn by <PixelSprite />.

// 3x5 digits, used to write numbers inside sprites (the level on the coin, the streak count).
const DIGITS = {
  0: ["###", "#.#", "#.#", "#.#", "###"],
  1: [".#.", "##.", ".#.", ".#.", "###"],
  2: ["###", "..#", "###", "#..", "###"],
  3: ["###", "..#", ".##", "..#", "###"],
  4: ["#.#", "#.#", "###", "..#", "..#"],
  5: ["###", "#..", "###", "..#", "###"],
  6: ["###", "#..", "###", "#.#", "###"],
  7: ["###", "..#", "..#", ".#.", ".#."],
  8: ["###", "#.#", "###", "#.#", "###"],
  9: ["###", "#.#", "###", "..#", "###"],
};

// A number as a grid, digits separated by one empty column.
export const numberGrid = (value, char = "o") => {
  const digits = String(value).split("");
  return DIGITS[0].map((_, row) =>
    digits.map((d) => DIGITS[d][row].replaceAll("#", char)).join("."),
  );
};

// Writes `overlay` over `grid` with its top-left corner at (x, y); "." leaves the pixel below.
const stamp = (grid, overlay, x, y) =>
  grid.map((line, row) => {
    const over = overlay[row - y];
    if (!over) return line;
    return line
      .split("")
      .map((ch, col) => {
        const o = over[col - x];
        return o && o !== "." ? o : ch;
      })
      .join("");
  });

// Round coin with a raised rim, lit from the top-left.
const makeCoin = (size) => {
  const c = (size - 1) / 2;
  const r = size / 2 - 0.3;
  const inside = (x, y) => (x - c) ** 2 + (y - c) ** 2 <= r * r;
  const rows = [];
  for (let y = 0; y < size; y++) {
    let line = "";
    for (let x = 0; x < size; x++) {
      if (!inside(x, y)) {
        line += ".";
      } else if (!inside(x - 1, y) || !inside(x + 1, y) || !inside(x, y - 1) || !inside(x, y + 1)) {
        line += "o";
      } else {
        const dist = Math.hypot(x - c, y - c);
        const topLeft = x - c + (y - c) < 0;
        if (dist > r - 2.2) line += topLeft ? "l" : "d";
        else if (dist > r - 3.2) line += topLeft ? "d" : "l";
        else line += "b";
      }
    }
    rows.push(line);
  }
  // A glint on the rim.
  return stamp(rows, ["s.", ".s"], Math.round(c - r / 2), Math.round(c - r / 2) + 1);
};

export const COIN = makeCoin(16);

// The coin of a level: its color shows the title tier, the level is written in the middle.
export const levelCoin = (level) => {
  const digits = numberGrid(Math.min(level, 99));
  const x = Math.floor((16 - digits[0].length) / 2);
  return stamp(COIN, digits, x, 6);
};

// One color set per title (every 5 levels): bronze, silver, gold, emerald, amethyst.
export const TIER_PALETTES = {
  Beginner: { o: "#5c3a1e", d: "#9a5b2c", b: "#c47a3d", l: "#e3a066", s: "#f7d3ac" },
  Organized: { o: "#3f4855", d: "#8a94a3", b: "#b8c0cc", l: "#dde2e8", s: "#ffffff" },
  Saver: { o: "#6b4a12", d: "#c08a1e", b: "#e8b931", l: "#f7d76b", s: "#fff4c2" },
  Strategist: { o: "#134e3a", d: "#1f7a55", b: "#2fa36f", l: "#6fd3a2", s: "#d1f7e4" },
  "Finance Master": { o: "#3b1f5c", d: "#6b3fa0", b: "#8f5fd0", l: "#b996ea", s: "#ece0fb" },
};

export const FLAME = {
  grid: [
    ".....o......",
    "....oro.....",
    "....orro....",
    "...orrro.o..",
    "...orrrooro.",
    "..orryrrrro.",
    "..orryyrrro.",
    ".orryyyyrro.",
    ".orryywyyro.",
    ".orryywwyro.",
    "..orywwwyo..",
    "...oooooo...",
  ],
  palette: { o: "#7c2d12", r: "#ea580c", y: "#f59e0b", w: "#fde68a" },
};

export const SNOWFLAKE = {
  grid: [
    "....o....",
    ".o..o..o.",
    "..o.o.o..",
    "...owo...",
    "ooowwwooo",
    "...owo...",
    "..o.o.o..",
    ".o..o..o.",
    "....o....",
  ],
  palette: { o: "#3b82f6", w: "#bfdbfe" },
};

// Badge of each achievement (keys are the API's achievement codes).
export const ACHIEVEMENT_SPRITES = {
  // A sprout in a pot: the journey starts.
  FIRST_STEP: {
    grid: [
      "............",
      "..ooo..ooo..",
      ".oggGooGggo.",
      ".ogggGGgggo.",
      "..oggGGggo..",
      "...ooGGoo...",
      ".....GG.....",
      "..oooGGooo..",
      ".obbbbbbbbo.",
      ".obbbbbbBBo.",
      "..obbbbBBo..",
      "...oooooo...",
    ],
    palette: { o: "#2f4a2a", g: "#6cc070", G: "#3f8f47", b: "#a0764f", B: "#7a5434" },
  },
  STREAK_7: FLAME,
  // A trophy: a whole month without breaking the streak.
  STREAK_30: {
    grid: [
      "..oooooooo..",
      "ooolyyyydooo",
      "o.olyyyydo.o",
      "o.olyyyydo.o",
      ".oolyyyydoo.",
      "..olyyyydo..",
      "...oyyydo...",
      "....oydo....",
      "....oydo....",
      "...oooooo...",
      "..oyyyyddo..",
      "..oooooooo..",
    ],
    palette: { o: "#6b4a12", y: "#e8b931", l: "#f7d76b", d: "#c08a1e" },
  },
  // A shield with a check: every budget respected.
  ON_BUDGET: {
    grid: [
      ".oooooooooo.",
      ".olllllbbbo.",
      ".ollbbbbbco.",
      ".olbbbbbcco.",
      ".olcbbbbcbo.",
      ".olccbbccbo.",
      ".obbccccbbo.",
      "..obbccbbo..",
      "..obbbbbbo..",
      "...obbbbo...",
      "....obbo....",
      ".....oo.....",
    ],
    palette: { o: "#5c4632", b: "#a88d6f", l: "#c9b293", c: "#166534" },
  },
  // A money bag with a gold coin: part of the income was kept.
  SAVER_20: {
    grid: [
      "...oo..oo...",
      "....obbo....",
      "....otto....",
      "...obbbbo...",
      "..obbbbbbo..",
      ".obbyyybbbo.",
      ".obbyYybbdo.",
      ".obbyyybbdo.",
      ".obbbbbbbdo.",
      ".obbbbbbddo.",
      "..obbbbddo..",
      "...oooooo...",
    ],
    palette: { o: "#5c4632", b: "#d9bf9f", d: "#a88d6f", t: "#7a5434", y: "#e8b931", Y: "#c08a1e" },
  },
  // A quiet night: days without spending.
  ZERO_DAY: {
    grid: [
      "...oooo.....",
      "..ommmmo..s.",
      ".ommmoo..sss",
      ".ommo.....s.",
      "ommo........",
      "ommo........",
      "ommo........",
      "oMmmo.......",
      ".oMmmoo.....",
      ".oMMmmmooo..",
      "..ooMMMMMo..",
      "....ooooo...",
    ],
    palette: { o: "#3b3f6b", m: "#c7d2fe", M: "#a5b4fc", s: "#f59e0b" },
  },
};
