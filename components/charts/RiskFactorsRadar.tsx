"use client";

import { useState } from "react";
import {
  RadarChart,
  Radar,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Fingerprint } from "lucide-react";
import type { RadarRow } from "@/lib/data";

const CANCER_COLORS: Record<string, string> = {
  Lung:     "#4A90E2",
  Breast:   "#FF6B6B",
  Colon:    "#22C1A2",
  Leukemia: "#5C4DFF",
  Skin:     "#FF9F40",
  Cervical: "#B19CD9",
  Prostate: "#1B2A4E",
  Liver:    "#6B7280",
};

interface Props {
  data: RadarRow[];
}

// Calcula un dominio ajustado al rango real de los datos seleccionados,
// con un poco de margen, para amplificar las diferencias visualmente.
function getZoomedDomain(data: RadarRow[], selected: string[]): [number, number] {
  const values: number[] = [];
  for (const row of data) {
    for (const cancer of selected) {
      const v = row[cancer];
      if (typeof v === "number") values.push(v);
    }
  }
  if (values.length === 0) return [0, 10];

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const padding = range * 0.3;
  const lo = Math.max(0, Math.floor((min - padding) * 10) / 10);
  const hi = Math.min(10, Math.ceil((max + padding) * 10) / 10);
  return [lo, hi];
}

export function RiskFactorsRadar({ data }: Props) {
  const allCancers = Object.keys(data[0] ?? {}).filter((k) => k !== "factor");

  // Por defecto: 3 cánceres muy diferentes para mostrar contraste
  const DEFAULT_SELECTION = ["Lung", "Liver", "Breast"].filter((c) => allCancers.includes(c));
  const [selected, setSelected] = useState<string[]>(
    DEFAULT_SELECTION.length > 0 ? DEFAULT_SELECTION : allCancers.slice(0, 3)
  );

  const toggle = (c: string) => {
    setSelected((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Fingerprint className="h-4 w-4 text-indigo-600" />
          <CardTitle className="text-base font-semibold">
            Perfil promedio de exposición por tipo de cáncer
          </CardTitle>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Cada polígono muestra el nivel promedio de exposición (0–10) a los 5 factores
          registrados en el dataset. <span className="italic">No representa causalidad clínica</span> —
          el dataset no incluye causas específicas como HPV o hepatitis viral.
        </p>
      </CardHeader>

      <CardContent>
        {/* Selector de tipos */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {allCancers.map((cancer) => {
            const isActive = selected.includes(cancer);
            const color = CANCER_COLORS[cancer] ?? "#6B7280";
            return (
              <button
                key={cancer}
                onClick={() => toggle(cancer)}
                className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full transition-all border ${
                  isActive
                    ? "text-white shadow-sm"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                }`}
                style={
                  isActive
                    ? { background: color, borderColor: color }
                    : undefined
                }
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: isActive ? "#fff" : color }}
                />
                {cancer}
              </button>
            );
          })}
        </div>

        {selected.length === 0 ? (
          <div className="text-center py-16 text-sm text-slate-500">
            Selecciona al menos un tipo de cáncer arriba.
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={data} outerRadius="75%">
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis
                  dataKey="factor"
                  tick={{ fontSize: 13, fontWeight: 600, fill: "#334155" }}
                />
                <PolarRadiusAxis
                  domain={getZoomedDomain(data, selected)}
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  tickCount={5}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                    fontSize: 13,
                  }}
                  formatter={(value: number) => [value.toFixed(2), ""]}
                />
                {selected.map((cancer) => {
                  const color = CANCER_COLORS[cancer] ?? "#6B7280";
                  return (
                    <Radar
                      key={cancer}
                      name={cancer}
                      dataKey={cancer}
                      stroke={color}
                      fill={color}
                      fillOpacity={0.18}
                      strokeWidth={2.5}
                    />
                  );
                })}
              </RadarChart>
            </ResponsiveContainer>

            <p className="text-[11px] text-slate-400 mt-2 text-center italic">
              Escala ajustada al rango observado para amplificar las diferencias entre cánceres.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
