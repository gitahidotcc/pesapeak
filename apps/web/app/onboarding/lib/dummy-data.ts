export const sampleAccounts = [
  { name: "Main Checking", provider: "ABC Bank", type: "Checking" },
  { name: "Savings Goal", provider: "PesaBank", type: "Savings" },
  { name: "Business Card", provider: "Global Credit", type: "Credit Card" },
];

export const sampleCsvPreview = [
  { date: "2025-11-01", description: "Cafè Luna", amount: "-12.50", category: "Dining" },
  { date: "2025-11-03", description: "Metro Card Reload", amount: "-25.00", category: "Transit" },
  { date: "2025-11-05", description: "Salary", amount: "+1,500.00", category: "Income" },
  { date: "2025-11-06", description: "Groceries Market", amount: "-42.30", category: "Groceries" },
];

export const sampleColumnMapping = [
  { source: "Transaction Date", target: "Date" },
  { source: "Notes", target: "Description" },
  { source: "Amount", target: "Amount" },
  { source: "Category", target: "Category" },
];

export const sampleCategories = [
  { name: "Groceries", tone: "house" },
  { name: "Transportation", tone: "bus" },
  { name: "Entertainment", tone: "ticket" },
  { name: "Savings", tone: "piggy-bank" },
  { name: "Utilities", tone: "bolt" },
  { name: "Subscriptions", tone: "play" },
];

export const sampleTransactions = [
  { description: "Bloom Juice Bar", amount: "-8.75", suggested: "Dining" },
  { description: "Zen Yoga Studio", amount: "-22.00", suggested: "Fitness" },
  { description: "Cloud Storage", amount: "-6.99", suggested: "Subscriptions" },
  { description: "City Bike Repair", amount: "-15.40", suggested: "Transportation" },
];

export const sampleBalances = [
  { account: "Main Checking", balance: 3650 },
  { account: "Savings Goal", balance: 8200 },
  { account: "Business Card", balance: -120 },
];

