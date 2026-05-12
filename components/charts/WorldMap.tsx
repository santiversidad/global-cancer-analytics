"use client";

import { useState } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { MapPin, Activity, Calendar, DollarSign } from "lucide-react";
import type { CountryStats } from "@/lib/data";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Color único por país — uno se identifica directamente por su tono
const COUNTRY_COLORS: Record<string, string> = {
  USA: "#5C4DFF",   // morado
  CHN: "#FF6B6B",   // rojo
  IND: "#22C1A2",   // turquesa
  BRA: "#4A90E2",   // azul
  GBR: "#FF9F40",   // naranja
  DEU: "#B19CD9",   // lavanda
  PAK: "#1ABC9C",   // verde
  CAN: "#E91E8C",   // rosa fucsia
  RUS: "#1B2A4E",   // navy
  AUS: "#F39C12",   // ámbar
};

// Centroides y escalas para enfocar cada país en el mini mapa del modal
const COUNTRY_VIEW: Record<string, { center: [number, number]; scale: number }> = {
  USA:       { center: [-98, 39],   scale: 600 },
  GBR:       { center: [-2, 54],    scale: 1400 },
  CHN:       { center: [104, 35],   scale: 600 },
  IND:       { center: [78, 22],    scale: 800 },
  PAK:       { center: [70, 30],    scale: 1000 },
  BRA:       { center: [-53, -10],  scale: 500 },
  DEU:       { center: [10, 51],    scale: 1400 },
  CAN:       { center: [-100, 60],  scale: 400 },
  RUS:       { center: [95, 62],    scale: 300 },
  AUS:       { center: [134, -25],  scale: 600 },
};

interface Props {
  data: CountryStats[];
}

export function WorldMap({ data }: Props) {
  const [selected, setSelected] = useState<CountryStats | null>(null);
  const [hovered, setHovered] = useState<CountryStats | null>(null);

  const byIso = new Map(data.map((d) => [d.iso, d]));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Mapa mundial de casos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <ComposableMap projectionConfig={{ scale: 140 }} style={{ width: "100%", height: "auto" }}>
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const name = geo.properties.name as string;
                  const stats = matchCountry(name, byIso);
                  const fill = stats ? (COUNTRY_COLORS[stats.iso] ?? "#5C4DFF") : "#EDF0F5";
                  const isHovered = hovered?.iso === stats?.iso;

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={fill}
                      stroke="#fff"
                      strokeWidth={isHovered ? 1.5 : 0.6}
                      style={{
                        default: { outline: "none", transition: "all 0.2s" },
                        hover: {
                          fill: stats ? (COUNTRY_COLORS[stats.iso] ?? "#5C4DFF") : "#D9DEE8",
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

          {/* Leyenda flotante con los países y sus colores */}
          <div className="absolute top-2 right-2 bg-white/95 backdrop-blur border border-slate-200 rounded-lg shadow-md p-3 max-h-[90%] overflow-y-auto">
            <div className="text-[10px] uppercase tracking-wide text-slate-500 font-bold mb-2">
              Países
            </div>
            <div className="space-y-1.5">
              {data.map((d) => (
                <div
                  key={d.iso}
                  className={`flex items-center gap-2 text-xs cursor-pointer rounded px-1.5 py-0.5 transition-colors ${
                    hovered?.iso === d.iso ? "bg-slate-100" : ""
                  }`}
                  onMouseEnter={() => setHovered(d)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => setSelected(d)}
                >
                  <span
                    className="w-3 h-3 rounded-sm flex-shrink-0"
                    style={{ background: COUNTRY_COLORS[d.iso] ?? "#5C4DFF" }}
                  />
                  <span className="text-slate-700 font-medium">{d.country}</span>
                  <span className="text-slate-400 ml-auto">{d.cases.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-xs text-slate-500 mt-2">
            Clic sobre un país para ver detalles completos
          </div>
        </div>

        {/* Modal de detalle */}
        <Dialog open={selected !== null} onOpenChange={(open) => !open && setSelected(null)}>
          <DialogContent className="sm:max-w-3xl">
            {selected && (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center shadow-md"
                      style={{ background: "linear-gradient(135deg, #22C1A2, #5C4DFF)" }}
                    >
                      <MapPin className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <DialogTitle className="text-2xl">{selected.country}</DialogTitle>
                      <DialogDescription>Estadísticas detalladas del país</DialogDescription>
                    </div>
                  </div>
                </DialogHeader>

                <div className="grid md:grid-cols-2 gap-5 mt-3">
                  {/* Columna izquierda: mini mapa del país */}
                  <div
                    className="rounded-xl p-3 flex items-center justify-center border border-slate-200"
                    style={{ background: "linear-gradient(135deg, #F8FAFC 0%, #EEF2FF 100%)" }}
                  >
                    <CountryFocusMap iso={selected.iso} countryName={selected.country} />
                  </div>

                  {/* Columna derecha: stats */}
                  <div className="space-y-3">
                    <div className="bg-slate-50 rounded-lg p-4 text-center">
                      <div className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
                        Pacientes registrados
                      </div>
                      <div
                        className="text-4xl font-bold mt-1"
                        style={{
                          background: "linear-gradient(135deg, #22C1A2, #5C4DFF)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                        }}
                      >
                        {selected.cases.toLocaleString()}
                      </div>
                    </div>

                    <StatRow
                      icon={<Activity className="h-4 w-4" />}
                      label="Cáncer más frecuente"
                      value={selected.topCancer}
                      color="#FF6B6B"
                    />
                    <StatRow
                      icon={<Calendar className="h-4 w-4" />}
                      label="Supervivencia promedio"
                      value={`${selected.avgSurvival.toFixed(1)} años`}
                      color="#22C1A2"
                    />
                    <StatRow
                      icon={<DollarSign className="h-4 w-4" />}
                      label="Costo promedio"
                      value={`$${selected.avgCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                      color="#4A90E2"
                    />
                  </div>
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

// Mini mapa centrado en el país seleccionado
function CountryFocusMap({ iso, countryName }: { iso: string; countryName: string }) {
  const view = COUNTRY_VIEW[iso] ?? { center: [0, 20] as [number, number], scale: 150 };
  const color = COUNTRY_COLORS[iso] ?? "#5C4DFF";

  return (
    <ComposableMap
      projection="geoMercator"
      projectionConfig={{ center: view.center, scale: view.scale }}
      style={{ width: "100%", height: 220 }}
    >
      <Geographies geography={GEO_URL}>
        {({ geographies }) =>
          geographies.map((geo) => {
            const name = geo.properties.name as string;
            const isSelected = matchByName(name) === iso;
            return (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill={isSelected ? color : "#E2E8F0"}
                stroke="#fff"
                strokeWidth={isSelected ? 1.2 : 0.5}
                style={{
                  default: { outline: "none", filter: isSelected ? `drop-shadow(0 2px 8px ${color}66)` : "none" },
                  hover: { outline: "none" },
                  pressed: { outline: "none" },
                }}
              />
            );
          })
        }
      </Geographies>
    </ComposableMap>
  );
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

function matchCountry(geoName: string, byIso: Map<string, CountryStats>): CountryStats | undefined {
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
  const iso = NAME_MAP[geoName];
  return iso ? byIso.get(iso) : undefined;
}
