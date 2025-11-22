"use client";

import { useRef, useState } from "react";
import { ACCOUNT_TYPE_LABELS } from "@/app/onboarding/types/onboarding-flow";
import { StepComponentProps } from "@/app/onboarding/types/step-component";
import { formatBalance } from "@/app/onboarding/lib/format";
import { parseCsv, type ParsedTransaction } from "@/app/onboarding/lib/csv-parser";
import { toast } from "sonner";
import { Upload, FileText, X } from "lucide-react";

type FileWithData = {
  file: File;
  accountId?: string;
  format?: string;
  transactionCount?: number;
  parsed?: ParsedTransaction[];
};

export function ImportCsvStep({ context }: StepComponentProps) {
  const { accounts, accountsLoading } = context;
  const [files, setFiles] = useState<FileWithData[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    const newFiles: FileWithData[] = [];

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
        toast.error(`${file.name} is not a CSV file`);
        continue;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 10MB limit`);
        continue;
      }

      try {
        const text = await file.text();
        const result = parseCsv(text);

        if (result.errors.length > 0) {
          toast.error(`${file.name}: ${result.errors[0]}`);
          continue;
        }

        if (result.transactions.length === 0) {
          toast.error(`${file.name}: No valid transactions found`);
          continue;
        }

        newFiles.push({
          file,
          format: result.format === "equity" ? "Equity Bank" : result.format === "mpesa" ? "MPesa" : "Unknown",
          transactionCount: result.transactions.length,
          parsed: result.transactions,
        });

        toast.success(`${file.name}: ${result.transactions.length} transactions parsed`);
      } catch (error) {
        toast.error(`Failed to read ${file.name}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    setFiles((prev) => [...prev, ...newFiles]);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const setFileAccount = (index: number, accountId: string) => {
    setFiles((prev) => prev.map((f, i) => (i === index ? { ...f, accountId } : f)));
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm text-muted-foreground">
          Import your transaction history from CSV files. We support <span className="font-semibold text-foreground">Equity Bank</span> and <span className="font-semibold text-foreground">MPesa</span> CSV formats.
        </p>
      </div>

      <div
        className={`rounded-2xl border-2 border-dashed bg-card p-8 text-center transition-colors ${
          isDragging ? "border-primary bg-primary/5" : "border-border/70"
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
        <p className="mt-4 text-lg font-semibold text-card-foreground">Drop CSV files here</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Supported formats: Equity Bank, MPesa • Max 10MB per file
        </p>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="mx-auto mt-4 inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
        >
          <FileText className="h-4 w-4" />
          Browse Files
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          multiple
          onChange={handleFileInput}
          className="hidden"
        />
      </div>

      {files.length > 0 && (
        <div className="space-y-3 rounded-2xl border border-border bg-card/30 p-5">
          <p className="text-sm font-semibold text-muted-foreground">Files to import:</p>
          <div className="space-y-2">
            {files.map((fileData, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-xl border border-border bg-card p-3"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-semibold text-card-foreground">{fileData.file.name}</p>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    {fileData.format && <span>{fileData.format}</span>}
                    {fileData.format && fileData.transactionCount !== undefined && <span>•</span>}
                    {fileData.transactionCount !== undefined && (
                      <span>{fileData.transactionCount} transaction{fileData.transactionCount !== 1 ? "s" : ""}</span>
                    )}
                  </div>
                  {accounts.length > 0 && (
                    <select
                      value={fileData.accountId || ""}
                      onChange={(e) => setFileAccount(index, e.target.value)}
                      className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="">Select an account...</option>
                      {accounts.map((account) => (
                        <option key={account.id} value={account.id}>
                          {account.name} ({account.currency})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="ml-3 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3 rounded-2xl border border-border bg-card/30 p-5">
        <p className="text-sm font-semibold text-muted-foreground">Available accounts:</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {accountsLoading ? (
            Array.from({ length: 2 }).map((_, index) => (
              <div
                key={index}
                className="flex h-24 animate-pulse items-center justify-between rounded-2xl bg-card px-5 py-3"
              >
                <div className="h-4 w-24 rounded-full bg-muted-foreground/30" />
                <div className="h-3 w-12 rounded-full bg-muted-foreground/30" />
              </div>
            ))
          ) : accounts.length > 0 ? (
            accounts.map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between rounded-2xl bg-card px-4 py-3 shadow-sm"
              >
                <div>
                  <p className="text-sm font-semibold text-card-foreground">{account.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {ACCOUNT_TYPE_LABELS[account.accountType] ?? account.accountType}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Balance: {formatBalance(account.totalBalance, account.currency)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-border/60 bg-card/40 p-4 text-sm text-muted-foreground">
              No accounts yet. Add one in the accounts step before importing transactions.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}