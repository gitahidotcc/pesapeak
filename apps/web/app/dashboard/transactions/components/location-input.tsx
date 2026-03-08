"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MapPin, X } from "lucide-react";
import { api } from "@/lib/trpc";
import { toast } from "sonner";

interface LocationInputProps {
  locationName: string;
  latitude: number | null;
  longitude: number | null;
  onLocationNameChange: (value: string) => void;
  onCoordinatesChange: (lat: number | null, lon: number | null) => void;
  onClear: () => void;
  error?: string;
  accountId?: string;
  /** When false, location suggestions query is disabled (e.g. when dialog is closed). */
  enabled?: boolean;
}

const NOMINATIM_USER_AGENT = "PesaPeak/1.0 (Personal finance app)";

function getDisplayNameFromNominatim(address: Record<string, string>): string {
  return (
    address.neighbourhood ||
    address.suburb ||
    address.village ||
    address.town ||
    address.city ||
    address.county ||
    address.state ||
    address.display_name ||
    "Current location"
  );
}

export function LocationInput({
  locationName,
  latitude,
  longitude,
  onLocationNameChange,
  onCoordinatesChange,
  onClear,
  error,
  accountId,
  enabled = true,
}: LocationInputProps) {
  const [suggestionOpen, setSuggestionOpen] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [inputValue, setInputValue] = useState(locationName);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(locationName);
  }, [locationName]);

  const prefix = inputValue.trim();
  const { data: suggestions = [] } = api.transactions.locationSuggestions.useQuery(
    { prefix, accountId },
    { enabled }
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setSuggestionOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleUseCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
            { headers: { "User-Agent": NOMINATIM_USER_AGENT } }
          );
          const data = (await res.json()) as { address?: Record<string, string>; display_name?: string };
          const name =
            data.address ? getDisplayNameFromNominatim(data.address as Record<string, string>) : data.display_name ?? "Current location";
          onLocationNameChange(name);
          setInputValue(name);
          onCoordinatesChange(lat, lon);
        } catch {
          onLocationNameChange("Current location");
          setInputValue("Current location");
          onCoordinatesChange(lat, lon);
        } finally {
          setLoadingLocation(false);
        }
      },
      () => {
        toast.error("Could not get your location. Check permissions or try again.");
        setLoadingLocation(false);
      }
    );
  }, [onLocationNameChange, onCoordinatesChange]);

  const hasLocation = locationName.trim() || latitude != null || longitude != null;

  return (
    <div className="space-y-2" ref={wrapperRef}>
      <label className="text-sm font-semibold text-foreground">
        Location (optional)
      </label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              onLocationNameChange(e.target.value);
              setSuggestionOpen(true);
            }}
            onFocus={() => suggestions.length > 0 && setSuggestionOpen(true)}
            placeholder="e.g. Westlands Mall"
            className={`w-full rounded-xl border border-border bg-background px-4 py-2.5 pr-8 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${error ? "border-destructive" : ""}`}
          />
          {suggestionOpen && suggestions.length > 0 && (
            <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-border bg-popover py-1 shadow-md">
              {suggestions
                .filter((s) => s.toLowerCase() !== inputValue.trim().toLowerCase())
                .slice(0, 10)
                .map((s) => (
                  <li
                    key={s}
                    role="option"
                    className="cursor-pointer px-3 py-2 text-sm hover:bg-muted"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      onLocationNameChange(s);
                      setInputValue(s);
                      setSuggestionOpen(false);
                    }}
                  >
                    {s}
                  </li>
                ))}
            </ul>
          )}
          {hasLocation && (
            <button
              type="button"
              onClick={() => {
                onClear();
                setInputValue("");
                setSuggestionOpen(false);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Clear location"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={loadingLocation}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-border bg-muted/30 px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50"
          title="Use current location"
        >
          <MapPin className="h-4 w-4" />
          {loadingLocation ? "..." : "Use current location"}
        </button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
