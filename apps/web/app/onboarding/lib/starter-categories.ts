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
    name: "Transport",
    icon: "car",
    color: "#3B82F6", // blue
    categories: [
      { name: "Fuel" },
      { name: "Matatu/Uber/Bolt" },
      { name: "Repairs" },
      { name: "Insurance" },
    ],
  },
  {
    name: "Food",
    icon: "gift",
    color: "#EF4444", // red
    categories: [
      { name: "Groceries" },
      { name: "Restaurants/Takeaway" },
      { name: "Fast Food" },
    ],
  },
  {
    name: "Utilities",
    icon: "home",
    color: "#F59E0B", // amber
    categories: [
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
    icon: "gift",
    color: "#10B981", // green
    categories: [
      { name: "Cinema/Events" },
      { name: "Streaming" },
      { name: "Games" },
    ],
  },
  {
    name: "Personal_Care",
    icon: "heart",
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

