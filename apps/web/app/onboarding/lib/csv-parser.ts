/**
 * CSV parser utilities for MPesa format
 */

export type ParsedTransaction = {
  date: string;
  description: string;
  amount: number; // in cents
  type: "credit" | "debit";
  balance?: number; // in cents
  reference?: string;
};

export type CsvFormat = "mpesa" | "unknown";

/**
 * Detect the CSV format based on headers
 */
export function detectCsvFormat(headers: string[]): CsvFormat {
  const headerStr = headers.join(",").toLowerCase();

  // MPesa format
  if (
    headerStr.includes("receipt no") &&
    headerStr.includes("completion time") &&
    headerStr.includes("details")
  ) {
    return "mpesa";
  }

  return "unknown";
}

/**
 * Parse a number string that may contain commas and currency symbols
 */
function parseAmount(value: string): number {
  if (!value || value.trim() === "") return 0;

  // Remove quotes, commas, and any currency symbols
  const cleaned = value.replace(/["',]/g, "").trim();

  // Parse as float and convert to cents
  const amount = parseFloat(cleaned);
  if (isNaN(amount)) return 0;

  return Math.round(amount * 100);
}

/**
 * Parse date string in YYYY-MM-DD format
 */
function parseDate(dateStr: string): string {
  if (!dateStr || dateStr.trim() === "") return "";

  const cleaned = dateStr.trim().replace(/"/g, "");

  // MPesa format is already YYYY-MM-DD
  if (cleaned.match(/^\d{4}-\d{2}-\d{2}/)) {
    return cleaned.split(" ")[0]; // Take only the date part, ignore time
  }

  return cleaned;
}

/**
 * Parse MPesa CSV format
 */
function parseMpesaRow(row: string[], headers: string[]): ParsedTransaction | null {
  // Find column indices
  const receiptIdx = headers.findIndex((h) => h.toLowerCase().includes("receipt no"));
  const timeIdx = headers.findIndex((h) => h.toLowerCase().includes("completion time"));
  const detailsIdx = headers.findIndex((h) => h.toLowerCase().includes("details"));
  const statusIdx = headers.findIndex((h) => h.toLowerCase().includes("transaction status"));
  const paidInIdx = headers.findIndex((h) => h.toLowerCase().includes("paid in"));
  const withdrawnIdx = headers.findIndex((h) => h.toLowerCase().includes("withdrawn"));
  const balanceIdx = headers.findIndex((h) => h.toLowerCase().includes("balance"));

  if (detailsIdx === -1 || timeIdx === -1) return null;

  const description = (row[detailsIdx] || "").trim();
  const timeStr = row[timeIdx] || "";
  const status = (row[statusIdx] || "").trim().toLowerCase();

  // Skip empty rows or non-completed transactions
  if (!description || !timeStr || status !== "completed") return null;

  const paidIn = parseAmount(row[paidInIdx] || "");
  const withdrawn = parseAmount(row[withdrawnIdx] || "");
  const balance = parseAmount(row[balanceIdx] || "");

  // Determine transaction type
  const amount = paidIn > 0 ? paidIn : -withdrawn;
  if (amount === 0) return null; // Skip zero-amount transactions

  return {
    date: parseDate(timeStr),
    description,
    amount,
    type: paidIn > 0 ? "credit" : "debit",
    balance: balance > 0 ? balance : undefined,
    reference: row[receiptIdx]?.trim() || undefined,
  };
}

/**
 * Parse CSV text into transactions
 */
export function parseCsv(csvText: string): {
  format: CsvFormat;
  transactions: ParsedTransaction[];
  errors: string[];
} {
  const errors: string[] = [];
  const transactions: ParsedTransaction[] = [];

  try {
    const lines = csvText.split("\n").filter((line) => line.trim() !== "");
    if (lines.length === 0) {
      errors.push("CSV file is empty");
      return { format: "unknown", transactions, errors };
    }

    // Parse headers (first line)
    const headerLine = lines[0];
    const headers = parseCsvLine(headerLine);

    // Detect format
    const format = detectCsvFormat(headers);
    if (format === "unknown") {
      errors.push("Unknown CSV format. Supported format: MPesa");
      return { format, transactions, errors };
    }

    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line || line.trim() === "") continue;

      try {
        const row = parseCsvLine(line);

        // Skip rows that are too short
        if (row.length < headers.length) continue;

        let transaction: ParsedTransaction | null = null;

        if (format === "mpesa") {
          transaction = parseMpesaRow(row, headers);
        }

        if (transaction) {
          transactions.push(transaction);
        }
      } catch (error) {
        errors.push(`Error parsing row ${i + 1}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    if (transactions.length === 0) {
      errors.push("No valid transactions found in CSV file");
    }

    return { format, transactions, errors };
  } catch (error) {
    errors.push(`Failed to parse CSV: ${error instanceof Error ? error.message : String(error)}`);
    return { format: "unknown" as CsvFormat, transactions, errors };
  }
}

/**
 * Parse a single CSV line, handling quoted fields
 */
function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let currentField = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        currentField += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote mode
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      // Field separator
      fields.push(currentField);
      currentField = "";
    } else {
      currentField += char;
    }
  }

  // Add the last field
  fields.push(currentField);

  return fields;
}

