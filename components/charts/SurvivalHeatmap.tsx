"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Thermometer } from "lucide-react";
import type { HeatmapCell } from "@/lib/data";

const STAGE_ORDER = ["Stage 0", "Stage I", "Stage II", "Stage III", "Stage IV"];
const CANCER_ORDER = ["Lung", "Breast", "Colon", "Leukemia", "Skin", "Cervical", "Prostate", "Liver"];

interface Props {
  data: HeatmapCell[];
}

export function SurvivalHeatmap({ data }: Props) {
  const [hovered, setHovered] = useState<HeatmapCell | null>(null);

  const cancerTypes = CANCER_ORDER.filter((c) => data.some((d) => d.cancerType === c));
  const stages = STAGE_ORDER.filter((s) => data.some((d) => d.stage === s));

  const values = data.map((d) => d.avgSurvival);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);

  const lookup = new Map<string, HeatmapCell>();
  for (const d of data) lookup.set(`${d.cancerType}|${d.stage}`, d);

  // Color: rojo (poca supervivencia) → ámbar → verde (mucha supervivencia)
  function colorFor(value: number) {
    const t = (value - minVal) / (maxVal - minVal || 1);
    const stops = [
      [0.0, [255, 107, 107]],   // rojo coral
      [0.5, [255, 159, 64]],    // ámbar
      [1.0, [34, 193, 162]],    // verde turquesa
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
    return "rgb(34, 193, 162)";
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Thermometer className="h-4 w-4 text-rose-500" />
          <CardTitle className="text-base font-semibold">
            Supervivencia por tipo de cáncer y etapa
          </CardTitle>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Cada celda muestra los <span className="font-semibold">años promedio de supervivencia</span> para esa
          combinación. Rojo = peor pronóstico, verde = mejor pronóstico.
        </p>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-separate" style={{ borderSpacing: "4px" }}>
            <thead>
              <tr>
                <th className="text-left p-2 text-xs uppercase tracking-wide text-slate-500 font-semibold w-32" />
                {stages.map((stage) => (
                  <th
                    key={stage}
                    className="text-center p-2 text-xs uppercase tracking-wide text-slate-600 font-bold"
                  >
                    {stage}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cancerTypes.map((cancer) => (
                <tr key={cancer}>
                  <td className="text-sm font-semibold text-slate-900 pr-3 whitespace-nowrap">
                    {cancer}
                  </td>
                  {stages.map((stage) => {
                    const cell = lookup.get(`${cancer}|${stage}`);
                    if (!cell) {
                      return (
                        <td
                          key={stage}
                          className="rounded-md bg-slate-100 text-slate-400 text-center text-xs h-14"
                        >
                          —
                        </td>
                      );
                    }
                    const isHovered =
                      hovered?.cancerType === cell.cancerType && hovered?.stage === cell.stage;
                    return (
                      <td
                        key={stage}
                        onMouseEnter={() => setHovered(cell)}
                        onMouseLeave={() => setHovered(null)}
                        className={`rounded-md text-center font-bold cursor-pointer h-14 transition-all ${
                          isHovered ? "scale-105 shadow-lg" : ""
                        }`}
                        style={{
                          background: colorFor(cell.avgSurvival),
                          color: "#1B2A4E",
                          minWidth: 80,
                        }}
                      >
                        <div className="text-base leading-none">
                          {cell.avgSurvival.toFixed(1)}
                        </div>
                        <div className="text-[10px] font-normal opacity-80 mt-1">
                          n={cell.count.toLocaleString()}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Leyenda de gradiente */}
        <div className="flex items-center justify-between mt-4 text-xs">
          <div className="text-slate-500">
            {hovered ? (
              <span>
                <span className="font-semibold text-slate-900">
                  {hovered.cancerType} · {hovered.stage}
                </span>
                : <span className="font-semibold">{hovered.avgSurvival.toFixed(2)} años</span> de
                supervivencia promedio sobre <span className="font-semibold">{hovered.count.toLocaleString()}</span> pacientes
              </span>
            ) : (
              "Pasa el cursor sobre una celda para ver el detalle"
            )}
          </div>
          <div className="flex items-center gap-2 text-slate-600 flex-shrink-0">
            <span>{minVal.toFixed(1)} años</span>
            <div
              className="h-3 w-28 rounded"
              style={{ background: "linear-gradient(to right, #FF6B6B, #FF9F40, #22C1A2)" }}
            />
            <span>{maxVal.toFixed(1)} años</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
