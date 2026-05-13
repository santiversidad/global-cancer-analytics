"use client";

import { useState } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Flame, Activity, Calendar, DollarSign } from "lucide-react";
import type { CountryStats } from "@/lib/data";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Gradiente: bajo (verde) → medio (amarillo) → alto (rojo)
function heatColor(t: number): string {
  const stops = [
    [0.0, [34, 193, 162]],   // teal/verde
    [0.5, [255, 159, 64]],   // ámbar
    [1.0, [255, 107, 107]],  // rojo
  ] as const;
  for (let i = 0; i < stops.length - 1; i++) {
    const [t1, c1] = stops[i];
    const [t2, c2] = stops[i + 1];
    if (t <= t2) {
      const local = (t - t1) / (t2 - t1);
      const r = Math.round(c1[0] + (c2[0] - c1[0]) * local);
      const g = Math.round(c1[1] + (c2[1] - c1[1]) * local);
      const b = Math.round(c1[2] + (c2[2] - c1[2]) * local);
      return `rgb(${r}, ${g}, ${b})`;
    }
  }
  return "rgb(255, 107, 107)";
}

function matchByName(name: string): string | undefined {
  const NAME_MAP: Record<string, string> = {
    "United States of America": "USA",
    "United Kingdom": "GBR",
    "China": "CHN",
    "India": "IND",
    "Pakistan": "PAK",
    "Brazil": "BRA",
    "Germany": "DEU",
    "Canada": "CAN",
    "Russia": "RUS",
    "Australia": "AUS",
  };
  return NAME_MAP[name];
}

interface Props {
  data: CountryStats[];
}

export function WorldHeatMap({ data }: Props) {
  const [selected, setSelected] = useState<CountryStats | null>(null);
  const [hovered, setHovered] = useState<CountryStats | null>(null);

  const byIso = new Map(data.map((d) => [d.iso, d]));

  // Aquí usamos costo promedio como métrica de "calor"
  const values = data.map((d) => d.avgCost);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Flame className="h-4 w-4 text-orange-500" />
          <CardTitle className="text-base font-semibold">Intensidad por costo de tratamiento</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <ComposableMap projectionConfig={{ scale: 140 }} style={{ width: "100%", height: "auto" }}>
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const name = geo.properties.name as string;
                  const iso = matchByName(name);
                  const stats = iso ? byIso.get(iso) : undefined;
                  const t = stats ? (stats.avgCost - minVal) / (maxVal - minVal || 1) : 0;
                  const fill = stats ? heatColor(t) : "#EDF0F5";

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={fill}
                      stroke="#fff"
                      strokeWidth={0.6}
                      style={{
                        default: { outline: "none", transition: "all 0.2s" },
                        hover: {
                          fill: stats ? fill : "#D9DEE8",
                          outline: "none",
                          cursor: stats ? "pointer" : "default",
                          filter: stats ? "brightness(1.15) drop-shadow(0 2px 4px rgba(0,0,0,0.2))" : "none",
                        },
                        pressed: { outline: "none" },
                      }}
                      onMouseEnter={() => stats && setHovered(stats)}
                      onMouseLeave={() => setHovered(null)}
                      onClick={() => stats && setSelected(stats)}
                    />
                  );
                })
              }
            </Geographies>
          </ComposableMap>

          {hovered && !selected && (
            <div className="absolute top-2 left-2 bg-white border border-slate-200 rounded-lg shadow-md px-3 py-2 text-sm pointer-events-none">
              <div className="font-bold text-slate-900">{hovered.country}</div>
              <div className="text-slate-600 text-xs">
                ${hovered.avgCost.toLocaleString(undefined, { maximumFractionDigits: 0 })} costo promedio
              </div>
            </div>
          )}

          {/* Leyenda de gradiente */}
          <div className="flex items-center justify-between mt-3 text-xs text-slate-600">
            <span className="text-slate-500">Clic sobre un país para ver detalles</span>
            <div className="flex items-center gap-2">
              <span>${minVal.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              <div
                className="h-3 w-32 rounded"
                style={{ background: "linear-gradient(to right, #22C1A2, #FF9F40, #FF6B6B)" }}
              />
              <span>${maxVal.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </div>
          </div>
        </div>

        <Dialog open={selected !== null} onOpenChange={(open) => !open && setSelected(null)}>
          <DialogContent className="sm:max-w-md">
            {selected && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-xl">{selected.country}</DialogTitle>
                  <DialogDescription>Indicadores económicos y de severidad</DialogDescription>
                </DialogHeader>
                <div className="space-y-2 mt-2">
                  <StatRow icon={<DollarSign className="h-4 w-4" />} label="Costo promedio" value={`$${selected.avgCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} color="#FF6B6B" />
                  <StatRow icon={<Activity className="h-4 w-4" />} label="Cáncer más frecuente" value={selected.topCancer} color="#5C4DFF" />
                  <StatRow icon={<Calendar className="h-4 w-4" />} label="Supervivencia promedio" value={`${selected.avgSurvival.toFixed(1)} años`} color="#22C1A2" />
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

function StatRow({
  icon, label, value, color,
}: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-lg border border-slate-200">
      <div className="flex items-center gap-2">
        <div style={{ color }}>{icon}</div>
        <span className="text-sm text-slate-600">{label}</span>
      </div>
      <span className="font-semibold text-slate-900">{value}</span>
    </div>
  );
}
