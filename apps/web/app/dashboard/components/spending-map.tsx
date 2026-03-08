"use client";

import { useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface MapItem {
  locationName: string;
  amount: number;
  latitude: number;
  longitude: number;
  transactionCount: number;
}

interface SpendingMapProps {
  data: MapItem[] | undefined;
  currency?: string;
}

function FitBounds({ items }: { items: MapItem[] }) {
  const map = useMap();
  useEffect(() => {
    if (items.length === 0) return;
    const bounds = L.latLngBounds(
      items.map((item) => [item.latitude, item.longitude] as [number, number])
    );
    map.fitBounds(bounds, { padding: [24, 24], maxZoom: 14 });
  }, [map, items]);
  return null;
}

function MapContent({
  items,
  currency,
}: {
  items: MapItem[];
  currency: string;
}) {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value / 100);

  const maxAmount = useMemo(
    () => (items.length > 0 ? Math.max(...items.map((i) => i.amount)) : 1),
    [items]
  );
  const scaleFactor = 8;
  const minRadius = 10;
  const maxRadius = 40;

  return (
    <>
      <FitBounds items={items} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {items.map((item, index) => {
        const radius = Math.min(
          maxRadius,
          Math.max(minRadius, Math.sqrt(item.amount) * scaleFactor)
        );
        return (
          <CircleMarker
            key={`${item.locationName}-${index}`}
            center={[item.latitude, item.longitude]}
            radius={radius}
            pathOptions={{
              fillColor: "hsl(var(--primary))",
              color: "hsl(var(--primary))",
              weight: 2,
              opacity: 0.9,
              fillOpacity: 0.5,
            }}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">{item.locationName}</p>
                <p className="text-muted-foreground">
                  {formatCurrency(item.amount)} · {item.transactionCount} transaction
                  {item.transactionCount !== 1 ? "s" : ""}
                </p>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </>
  );
}

export function SpendingMap({ data, currency = "USD" }: SpendingMapProps) {
  const items = data ?? [];

  if (items.length === 0) {
    return (
      <Card className="col-span-2 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Spending map</CardTitle>
        </CardHeader>
        <CardContent className="flex h-[300px] items-center justify-center text-muted-foreground">
          <div className="text-center">
            <p className="text-sm">No location data with coordinates this period</p>
            <p className="mt-1 text-xs">
              Use &quot;Use current location&quot; when adding transactions to see them on the map.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-2 shadow-sm overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Spending map</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[300px] w-full">
          <MapContainer
            center={[items[0].latitude, items[0].longitude]}
            zoom={10}
            className="h-full w-full"
            scrollWheelZoom={true}
          >
            <MapContent items={items} currency={currency} />
          </MapContainer>
        </div>
      </CardContent>
    </Card>
  );
}
