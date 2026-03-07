/**
 * Starter categories for onboarding
 * These will be created automatically when users go through the onboarding flow
 */

export type StarterCategory = {
  name: string;
  icon?: string;
  color?: string;
};

export type StarterFolder = {
  name: string;
  icon: string;
  color: string;
  categories: StarterCategory[];
};

export const STARTER_CATEGORIES: StarterFolder[] = [
  {
    name: "School",
    icon: "graduation-cap",
    color: "#6366F1", // indigo
    categories: [{ name: "Administrative fees" }],
  },
  {
    name: "Funds Held for others",
    icon: "hand-coins",
    color: "#14B8A6", // teal
    categories: [
      { name: "Family" },
      { name: "Colleagues" },
    ],
  },
  {
    name: "Income",
    icon: "briefcase",
    color: "#22C55E", // green
    categories: [
      { name: "Family" },
      { name: "Salary" },
      { name: "Freelancing" },
    ],
  },
  {
    name: "Household & Family",
    icon: "users",
    color: "#A855F7", // violet
    categories: [
      { name: "Cousins" },
      { name: "Shopping" },
    ],
  },
  {
    name: "Subscriptions",
    icon: "repeat",
    color: "#F43F5E", // rose
    categories: [
      { name: "Entertainment" },
      { name: "Cloud Storage" },
    ],
  },
  {
    name: "Transport",
    icon: "car",
    color: "#3B82F6", // blue
    categories: [
      { name: "Parking" },
      { name: "Driving License" },
      { name: "Fuel" },
      { name: "Matatu/Uber/Bolt" },
      { name: "Repairs" },
      { name: "Insurance" },
    ],
  },
  {
    name: "Food",
    icon: "utensils-crossed",
    color: "#EF4444", // red
    categories: [
      { name: "Snacks" },
      { name: "Groceries" },
      { name: "Restaurants/Takeaway" },
      { name: "Fast Food" },
    ],
  },
  {
    name: "Utilities",
    icon: "zap",
    color: "#F59E0B", // amber
    categories: [
      { name: "Airtime" },
      { name: "Electricity" },
      { name: "Water" },
      { name: "Internet" },
      { name: "Gas" },
    ],
  },
  {
    name: "Home",
    icon: "home",
    color: "#8B5CF6", // purple
    categories: [
      { name: "Laundry" },
      { name: "Shopping" },
      { name: "Rent" },
      { name: "Repairs" },
      { name: "Furniture/Appliances" },
    ],
  },
  {
    name: "Health",
    icon: "heart",
    color: "#EC4899", // pink
    categories: [
      { name: "Clinic/Pharmacy" },
      { name: "Insurance" },
      { name: "Wellness/Gym" },
    ],
  },
  {
    name: "Entertainment",
    icon: "film",
    color: "#10B981", // green
    categories: [
      { name: "Cinema/Events" },
      { name: "Streaming" },
      { name: "Games" },
    ],
  },
  {
    name: "Personal_Care",
    icon: "sparkles",
    color: "#F97316", // orange
    categories: [
      { name: "Hair/Beauty" },
      { name: "Massage" },
      { name: "Supplements" },
    ],
  },
  {
    name: "Finance",
    icon: "trending-up",
    color: "#06B6D4", // cyan
    categories: [
      { name: "Loans" },
      { name: "Savings" },
      { name: "Investments" },
    ],
  },
  {
    name: "Fees",
    icon: "banknote",
    color: "#6B7280", // gray
    categories: [
      { name: "Mpesa Fees" },
      { name: "Equity Fees" },
    ],
  },
];

