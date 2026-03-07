import type { LucideIcon } from "lucide-react";
import {
  Banknote,
  Wallet,
  CreditCard,
  PiggyBank,
  Coins,
  Landmark,
  Building,
  Building2,
  Home,
  Briefcase,
  ShoppingCart,
  TrendingUp,
  DollarSign,
  Euro,
  Bitcoin,
  Smartphone,
  Car,
  Plane,
  Gift,
  Heart,
  GraduationCap,
  Users,
  HandCoins,
  Laptop,
  UtensilsCrossed,
  Apple,
  Coffee,
  Zap,
  Droplet,
  Wifi,
  Flame,
  Phone,
  Fuel,
  CircleParking,
  FileText,
  Wrench,
  Shield,
  MapPin,
  Film,
  Tv,
  Gamepad2,
  Cloud,
  Repeat,
  Scissors,
  Sparkles,
  Dumbbell,
  Pill,
  ShoppingBag,
  Shirt,
  Armchair,
} from "lucide-react";

export const ICON_MAP: Record<string, LucideIcon> = {
  // Original icons (never remove - used in past migrations/data)
  banknote: Banknote,
  wallet: Wallet,
  "credit-card": CreditCard,
  "piggy-bank": PiggyBank,
  coins: Coins,
  landmark: Landmark,
  building: Building,
  "building-2": Building2,
  home: Home,
  briefcase: Briefcase,
  "shopping-cart": ShoppingCart,
  "trending-up": TrendingUp,
  "dollar-sign": DollarSign,
  euro: Euro,
  bitcoin: Bitcoin,
  smartphone: Smartphone,
  car: Car,
  plane: Plane,
  gift: Gift,
  heart: Heart,

  // New icons for category expansion
  "graduation-cap": GraduationCap,
  users: Users,
  "hand-coins": HandCoins,
  laptop: Laptop,
  "utensils-crossed": UtensilsCrossed,
  apple: Apple,
  coffee: Coffee,
  zap: Zap,
  droplet: Droplet,
  wifi: Wifi,
  flame: Flame,
  phone: Phone,
  fuel: Fuel,
  "circle-parking": CircleParking,
  "file-text": FileText,
  wrench: Wrench,
  shield: Shield,
  "map-pin": MapPin,
  film: Film,
  tv: Tv,
  "gamepad-2": Gamepad2,
  cloud: Cloud,
  repeat: Repeat,
  scissors: Scissors,
  sparkles: Sparkles,
  dumbbell: Dumbbell,
  pill: Pill,
  "shopping-bag": ShoppingBag,
  shirt: Shirt,
  armchair: Armchair,
};

export type IconOption = {
  value: string;
  label: string;
  Icon: LucideIcon;
  category: string;
};

export const ICON_OPTIONS: IconOption[] = [
  // Banking
  { value: "banknote", label: "Banknote", Icon: Banknote, category: "Banking" },
  { value: "wallet", label: "Wallet", Icon: Wallet, category: "Banking" },
  { value: "credit-card", label: "Credit Card", Icon: CreditCard, category: "Banking" },
  { value: "piggy-bank", label: "Piggy Bank", Icon: PiggyBank, category: "Banking" },
  { value: "coins", label: "Coins", Icon: Coins, category: "Banking" },
  { value: "landmark", label: "Bank", Icon: Landmark, category: "Banking" },
  { value: "hand-coins", label: "Hand Coins", Icon: HandCoins, category: "Banking" },

  // Business
  { value: "building", label: "Building", Icon: Building, category: "Business" },
  { value: "building-2", label: "Office", Icon: Building2, category: "Business" },
  { value: "briefcase", label: "Briefcase", Icon: Briefcase, category: "Business" },
  { value: "laptop", label: "Laptop", Icon: Laptop, category: "Business" },
  { value: "graduation-cap", label: "School", Icon: GraduationCap, category: "Business" },
  { value: "file-text", label: "Document", Icon: FileText, category: "Business" },

  // Personal
  { value: "home", label: "Home", Icon: Home, category: "Personal" },
  { value: "shopping-cart", label: "Shopping Cart", Icon: ShoppingCart, category: "Personal" },
  { value: "shopping-bag", label: "Shopping Bag", Icon: ShoppingBag, category: "Personal" },
  { value: "car", label: "Car", Icon: Car, category: "Personal" },
  { value: "plane", label: "Travel", Icon: Plane, category: "Personal" },
  { value: "gift", label: "Gift", Icon: Gift, category: "Personal" },
  { value: "heart", label: "Heart", Icon: Heart, category: "Personal" },
  { value: "users", label: "Users", Icon: Users, category: "Personal" },
  { value: "shirt", label: "Laundry", Icon: Shirt, category: "Personal" },
  { value: "armchair", label: "Furniture", Icon: Armchair, category: "Personal" },

  // Food & Dining
  { value: "utensils-crossed", label: "Dining", Icon: UtensilsCrossed, category: "Food" },
  { value: "apple", label: "Groceries", Icon: Apple, category: "Food" },
  { value: "coffee", label: "Coffee/Food", Icon: Coffee, category: "Food" },

  // Transport
  { value: "fuel", label: "Fuel", Icon: Fuel, category: "Transport" },
  { value: "circle-parking", label: "Parking", Icon: CircleParking, category: "Transport" },
  { value: "wrench", label: "Repairs", Icon: Wrench, category: "Transport" },
  { value: "shield", label: "Insurance", Icon: Shield, category: "Transport" },
  { value: "map-pin", label: "Location/Rideshare", Icon: MapPin, category: "Transport" },

  // Utilities
  { value: "zap", label: "Electricity", Icon: Zap, category: "Utilities" },
  { value: "droplet", label: "Water", Icon: Droplet, category: "Utilities" },
  { value: "wifi", label: "Internet", Icon: Wifi, category: "Utilities" },
  { value: "flame", label: "Gas", Icon: Flame, category: "Utilities" },
  { value: "phone", label: "Phone/Airtime", Icon: Phone, category: "Utilities" },

  // Entertainment
  { value: "film", label: "Cinema", Icon: Film, category: "Entertainment" },
  { value: "tv", label: "Streaming", Icon: Tv, category: "Entertainment" },
  { value: "gamepad-2", label: "Games", Icon: Gamepad2, category: "Entertainment" },
  { value: "cloud", label: "Cloud Storage", Icon: Cloud, category: "Entertainment" },
  { value: "repeat", label: "Subscriptions", Icon: Repeat, category: "Entertainment" },

  // Health & Personal Care
  { value: "pill", label: "Pharmacy", Icon: Pill, category: "Health" },
  { value: "dumbbell", label: "Gym", Icon: Dumbbell, category: "Health" },
  { value: "scissors", label: "Hair/Beauty", Icon: Scissors, category: "Personal Care" },
  { value: "sparkles", label: "Beauty", Icon: Sparkles, category: "Personal Care" },

  // Finance
  { value: "trending-up", label: "Investment", Icon: TrendingUp, category: "Finance" },
  { value: "dollar-sign", label: "Dollar", Icon: DollarSign, category: "Finance" },
  { value: "euro", label: "Euro", Icon: Euro, category: "Finance" },
  { value: "bitcoin", label: "Crypto", Icon: Bitcoin, category: "Finance" },

  // Digital
  { value: "smartphone", label: "Mobile Money", Icon: Smartphone, category: "Digital" },
];

/** Default fallback icon when selected icon is not found */
export const DEFAULT_ICON = Banknote;
