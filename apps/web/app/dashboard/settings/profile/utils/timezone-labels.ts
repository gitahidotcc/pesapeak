"use client";

const now = new Date();

function padNumber(num: number) {
    return String(num).padStart(2, "0");
}

export function formatTimezoneOffset(timezone: string) {
    try {
        const dtf = new Intl.DateTimeFormat("en-US", {
            timeZone: timezone,
            timeZoneName: "short",
        });

        const zonePart = dtf.formatToParts(now).find((part) => part.type === "timeZoneName")?.value ?? "";
        const match = zonePart.match(/GMT([+-])(\d{1,2})(?::?(\d{2}))?/);

        if (!match) {
            return "+0000";
        }

        const [, sign, hourStr, minuteStr] = match;
        const hours = padNumber(Number(hourStr));
        const minutes = minuteStr ?? "00";

        return `${sign}${hours}${minutes}`;
    } catch {
        return "+0000";
    }
}

