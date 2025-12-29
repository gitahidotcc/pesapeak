"use client";

import { useState } from "react";
import { Search, Check } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

const CURRENCIES = [
    // Popular
    { code: "USD", name: "US Dollar", emoji: "🇺🇸", region: "Popular" },
    { code: "EUR", name: "Euro", emoji: "🇪🇺", region: "Popular" },
    { code: "GBP", name: "British Pound", emoji: "🇬🇧", region: "Popular" },
    { code: "JPY", name: "Japanese Yen", emoji: "🇯🇵", region: "Popular" },
    { code: "CNY", name: "Chinese Yuan", emoji: "🇨🇳", region: "Popular" },

    // Africa
    { code: "KES", name: "Kenyan Shilling", emoji: "🇰🇪", region: "Africa" },
    { code: "NGN", name: "Nigerian Naira", emoji: "🇳🇬", region: "Africa" },
    { code: "ZAR", name: "South African Rand", emoji: "🇿🇦", region: "Africa" },
    { code: "EGP", name: "Egyptian Pound", emoji: "🇪🇬", region: "Africa" },
    { code: "GHS", name: "Ghanaian Cedi", emoji: "🇬🇭", region: "Africa" },
    { code: "TZS", name: "Tanzanian Shilling", emoji: "🇹🇿", region: "Africa" },
    { code: "UGX", name: "Ugandan Shilling", emoji: "🇺🇬", region: "Africa" },
    { code: "MAD", name: "Moroccan Dirham", emoji: "🇲🇦", region: "Africa" },

    // Americas
    { code: "CAD", name: "Canadian Dollar", emoji: "🇨🇦", region: "Americas" },
    { code: "MXN", name: "Mexican Peso", emoji: "🇲🇽", region: "Americas" },
    { code: "BRL", name: "Brazilian Real", emoji: "🇧🇷", region: "Americas" },
    { code: "ARS", name: "Argentine Peso", emoji: "🇦🇷", region: "Americas" },

    // Asia Pacific
    { code: "AUD", name: "Australian Dollar", emoji: "🇦🇺", region: "Asia Pacific" },
    { code: "NZD", name: "New Zealand Dollar", emoji: "🇳🇿", region: "Asia Pacific" },
    { code: "INR", name: "Indian Rupee", emoji: "🇮🇳", region: "Asia Pacific" },
    { code: "SGD", name: "Singapore Dollar", emoji: "🇸🇬", region: "Asia Pacific" },
    { code: "HKD", name: "Hong Kong Dollar", emoji: "🇭🇰", region: "Asia Pacific" },
    { code: "KRW", name: "South Korean Won", emoji: "🇰🇷", region: "Asia Pacific" },
    { code: "THB", name: "Thai Baht", emoji: "🇹🇭", region: "Asia Pacific" },
    { code: "MYR", name: "Malaysian Ringgit", emoji: "🇲🇾", region: "Asia Pacific" },
    { code: "IDR", name: "Indonesian Rupiah", emoji: "🇮🇩", region: "Asia Pacific" },
    { code: "PHP", name: "Philippine Peso", emoji: "🇵🇭", region: "Asia Pacific" },
    { code: "VND", name: "Vietnamese Dong", emoji: "🇻🇳", region: "Asia Pacific" },

    // Middle East
    { code: "AED", name: "UAE Dirham", emoji: "🇦🇪", region: "Middle East" },
    { code: "SAR", name: "Saudi Riyal", emoji: "🇸🇦", region: "Middle East" },
    { code: "ILS", name: "Israeli Shekel", emoji: "🇮🇱", region: "Middle East" },

    // Europe
    { code: "CHF", name: "Swiss Franc", emoji: "🇨🇭", region: "Europe" },
    { code: "SEK", name: "Swedish Krona", emoji: "🇸🇪", region: "Europe" },
    { code: "NOK", name: "Norwegian Krone", emoji: "🇳🇴", region: "Europe" },
    { code: "DKK", name: "Danish Krone", emoji: "🇩🇰", region: "Europe" },
    { code: "PLN", name: "Polish Zloty", emoji: "🇵🇱", region: "Europe" },
    { code: "CZK", name: "Czech Koruna", emoji: "🇨🇿", region: "Europe" },
    { code: "HUF", name: "Hungarian Forint", emoji: "🇭🇺", region: "Europe" },
    { code: "RON", name: "Romanian Leu", emoji: "🇷🇴", region: "Europe" },
    { code: "TRY", name: "Turkish Lira", emoji: "🇹🇷", region: "Europe" },
    { code: "RUB", name: "Russian Ruble", emoji: "🇷🇺", region: "Europe" },
];

interface CurrencyDialogPickerProps {
    value: string;
    onSelect: (currency: string) => void;
}

export function CurrencyDialogPicker({ value, onSelect }: CurrencyDialogPickerProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");

    const selectedCurrency = CURRENCIES.find((c) => c.code === value);

    const filteredCurrencies = CURRENCIES.filter((currency) => {
        const searchLower = search.toLowerCase();
        return (
            currency.code.toLowerCase().includes(searchLower) ||
            currency.name.toLowerCase().includes(searchLower) ||
            currency.region.toLowerCase().includes(searchLower)
        );
    });

    const groupedCurrencies = filteredCurrencies.reduce((acc, currency) => {
        if (!acc[currency.region]) {
            acc[currency.region] = [];
        }
        acc[currency.region].push(currency);
        return acc;
    }, {} as Record<string, typeof CURRENCIES>);

    const handleSelect = (code: string) => {
        onSelect(code);
        setOpen(false);
        setSearch("");
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button
                    type="button"
                    className="flex w-full items-center justify-between rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                    <span className="flex items-center gap-2">
                        {selectedCurrency ? (
                            <>
                                <span className="text-lg">{selectedCurrency.emoji}</span>
                                <span className="font-medium">{selectedCurrency.code}</span>
                                <span className="text-muted-foreground">— {selectedCurrency.name}</span>
                            </>
                        ) : (
                            <span className="text-muted-foreground">Select currency</span>
                        )}
                    </span>
                    <Search className="h-4 w-4 text-muted-foreground" />
                </button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Select Currency</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search currencies..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-lg border border-border bg-background py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>

                    <div className="max-h-[400px] space-y-4 overflow-y-auto pr-2">
                        {Object.entries(groupedCurrencies).map(([region, currencies]) => (
                            <div key={region} className="space-y-2">
                                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    {region}
                                </p>
                                <div className="space-y-1">
                                    {currencies.map((currency) => (
                                        <button
                                            key={currency.code}
                                            type="button"
                                            onClick={() => handleSelect(currency.code)}
                                            className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted"
                                        >
                                            <span className="flex items-center gap-3">
                                                <span className="text-lg">{currency.emoji}</span>
                                                <span>
                                                    <span className="font-semibold">{currency.code}</span>
                                                    <span className="ml-2 text-muted-foreground">{currency.name}</span>
                                                </span>
                                            </span>
                                            {value === currency.code && (
                                                <Check className="h-4 w-4 text-primary" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                        {filteredCurrencies.length === 0 && (
                            <p className="py-8 text-center text-sm text-muted-foreground">
                                No currencies found
                            </p>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
