"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GitBranch } from "lucide-react";
import type { CorrelationCell } from "@/lib/data";

// Etiquetas amigables en español
const LABELS: Record<string, string> = {
  Age:                   "Edad",
  Genetic_Risk:          "Genético",
  Air_Pollution:         "Polución",
  Alcohol_Use:           "Alcohol",
  Smoking:               "Tabaco",
  Obesity_Level:         "Obesidad",
  Treatment_Cost_USD:    "Costo",
  Survival_Years:        "Supervivencia",
  Target_Severity_Score: "Severidad",
};

// Paleta divergente: azul (correlación negativa) → blanco (cero) → rojo (positiva)
function corrColor(v: number): string {
  // Clamp -1..1
  const t = Math.max(-1, Math.min(1, v));
  if (t >= 0) {
    const local = t;
    const r = Math.round(255);
    const g = Math.round(255 - (255 - 107) * local);
    const b = Math.round(255 - (255 - 107) * local);
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    const local = -t;
    const r = Math.round(255 - (255 - 74) * local);
    const g = Math.round(255 - (255 - 144) * local);
    const b = Math.round(255 - (255 - 226) * local);
    return `rgb(${r}, ${g}, ${b})`;
  }
}

interface Props {
  data: CorrelationCell[];
}

export function CorrelationMatrix({ data }: Props) {
  const [hovered, setHovered] = useState<CorrelationCell | null>(null);

  const cols = Array.from(new Set(data.map((d) => d.x)));
  const lookup = new Map<string, CorrelationCell>();
  for (const d of data) lookup.set(`${d.x}|${d.y}`, d);

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-2">
          <GitBranch className="h-4 w-4 text-indigo-600" />
          <CardTitle className="text-base font-semibold">
            Matriz de correlación entre variables
          </CardTitle>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Coeficiente de Pearson entre cada par de variables numéricas. Valores cercanos a{" "}
          <span className="font-semibold text-rose-600">+1</span> indican correlación positiva fuerte,
          a <span className="font-semibold text-blue-600">−1</span> negativa fuerte, y a{" "}
          <span className="font-semibold text-slate-600">0</span> ausencia de relación lineal.
        </p>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <table className="border-separate mx-auto" style={{ borderSpacing: "3px" }}>
            <thead>
              <tr>
                <th />
                {cols.map((c) => (
                  <th key={c} className="text-xs font-semibold text-slate-600 py-2 px-1 align-bottom">
                    <div className="origin-bottom-left -rotate-45 whitespace-nowrap translate-y-2">
                      {LABELS[c] ?? c}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cols.map((y) => (
                <tr key={y}>
                  <td className="text-xs font-semibold text-slate-700 pr-3 text-right whitespace-nowrap">
                    {LABELS[y] ?? y}
                  </td>
                  {cols.map((x) => {
                    const cell = lookup.get(`${x}|${y}`);
                    if (!cell) return <td key={x} className="bg-slate-100 w-12 h-12 rounded" />;
                    const isDiag = x === y;
                    const isHovered =
                      hovered?.x === cell.x && hovered?.y === cell.y;
                    return (
                      <td
                        key={x}
                        onMouseEnter={() => setHovered(cell)}
                        onMouseLeave={() => setHovered(null)}
                        className={`w-12 h-12 rounded text-center text-[11px] font-semibold cursor-pointer transition-all ${
                          isHovered ? "scale-110 shadow-md ring-2 ring-slate-900" : ""
                        }`}
                        style={{
                          background: corrColor(cell.value),
                          color: Math.abs(cell.value) > 0.5 ? "#fff" : "#1B2A4E",
                          opacity: isDiag ? 0.6 : 1,
                        }}
                      >
                        {cell.value.toFixed(2)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Leyenda + descripción */}
        <div className="flex items-center justify-between mt-4 text-xs">
          <div className="text-slate-500">
            {hovered ? (
              <span>
                <span className="font-semibold text-slate-900">
                  {(LABELS[hovered.x] ?? hovered.x)} ↔ {(LABELS[hovered.y] ?? hovered.y)}
                </span>
                : correlación de{" "}
                <span className="font-semibold">{hovered.value.toFixed(3)}</span>
                {" "}
                <span className="text-slate-400 italic">
                  ({describeCorrelation(hovered.value)})
                </span>
              </span>
            ) : (
              "Pasa el cursor sobre una celda para ver el detalle"
            )}
          </div>
          <div className="flex items-center gap-2 text-slate-600 flex-shrink-0">
            <span>−1</span>
            <div
              className="h-3 w-32 rounded"
              style={{ background: "linear-gradient(to right, #4A90E2, #ffffff, #FF6B6B)" }}
            />
            <span>+1</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function describeCorrelation(v: number): string {
  const abs = Math.abs(v);
  const dir = v > 0 ? "positiva" : v < 0 ? "negativa" : "nula";
  if (abs < 0.1) return "prácticamente nula";
  if (abs < 0.3) return `débil ${dir}`;
  if (abs < 0.6) return `moderada ${dir}`;
  if (abs < 0.8) return `fuerte ${dir}`;
  return `muy fuerte ${dir}`;
}
