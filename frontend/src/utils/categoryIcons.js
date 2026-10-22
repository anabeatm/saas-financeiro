import {
  Banknote,
  Briefcase,
  Bus,
  Car,
  Coffee,
  Dumbbell,
  Gamepad2,
  Gift,
  GraduationCap,
  HeartPulse,
  House,
  PiggyBank,
  Plane,
  Receipt,
  Shirt,
  ShoppingCart,
  Smartphone,
  Tag,
  TrendingUp,
  Utensils,
  Wallet,
  Zap,
} from "lucide-react";

// The API stores the icon as a name; these are the ones the app can draw (the seeded defaults included).
export const CATEGORY_ICONS = {
  wallet: Wallet,
  "piggy-bank": PiggyBank,
  banknote: Banknote,
  briefcase: Briefcase,
  "trending-up": TrendingUp,
  gift: Gift,
  utensils: Utensils,
  coffee: Coffee,
  "shopping-cart": ShoppingCart,
  shirt: Shirt,
  bus: Bus,
  car: Car,
  plane: Plane,
  home: House,
  zap: Zap,
  smartphone: Smartphone,
  receipt: Receipt,
  "heart-pulse": HeartPulse,
  dumbbell: Dumbbell,
  "graduation-cap": GraduationCap,
  "gamepad-2": Gamepad2,
};

export const getCategoryIcon = (name) => CATEGORY_ICONS[name] ?? Tag;

export const CATEGORY_COLORS = [
  "#2ECC71",
  "#27AE60",
  "#3498DB",
  "#9B59B6",
  "#E74C3C",
  "#E67E22",
  "#F1C40F",
  "#1ABC9C",
  "#A88D6F",
  "#7F8C8D",
];

export const DEFAULT_CATEGORY_COLOR = "#A88D6F";
