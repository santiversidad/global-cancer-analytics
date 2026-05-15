"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown } from "lucide-react";
import type { StageDistCell } from "@/lib/data";

const STAGE_ORDER = ["Stage 0", "Stage I", "Stage II", "Stage III", "Stage IV"];
const CANCER_ORDER = ["Lung", "Breast", "Colon", "Leukemia", "Skin", "Cervical", "Prostate", "Liver"];

// Gradiente secuencial: crema → morado (la marca)
function pctColor(pct: number, max: number): string {
  const t = Math.max(0, Math.min(1, pct / max));
  const r = Math.round(248 - (248 - 92) * t);
  const g = Math.round(247 - (247 - 77) * t);
  const b = Math.round(255 - (255 - 255) * t);
  return `rgb(${r}, ${g}, ${b})`;
}

interface Props {
  data: StageDistCell[];
}

export function StageDistHeatmap({ data }: Props) {
  const [hovered, setHovered] = useState<StageDistCell | null>(null);

  const cancerTypes = CANCER_ORDER.filter((c) => data.some((d) => d.cancerType === c));
  const stages = STAGE_ORDER.filter((s) => data.some((d) => d.stage === s));

  const lookup = new Map<string, StageDistCell>();
  for (const d of data) lookup.set(`${d.cancerType}|${d.stage}`, d);

  const maxPct = Math.max(...data.map((d) => d.pct));

  // Auto-hallazgo: ¿algún cáncer tiene >40% en etapas avanzadas (III+IV)?
  const advancedRates = cancerTypes.map((c) => {
    const advanced = data
      .filter((d) => d.cancerType === c && (d.stage === "Stage III" || d.stage === "Stage IV"))
      .reduce((s, d) => s + d.pct, 0);
    return { cancerType: c, pct: advanced };
  });
  const maxAdvanced = advancedRates.reduce((a, b) => (a.pct > b.pct ? a : b));
  const minAdvanced = advancedRates.reduce((a, b) => (a.pct < b.pct ? a : b));
  const advancedRange = maxAdvanced.pct - minAdvanced.pct;
  const isUniform = advancedRange < 3;

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-2">
          <TrendingDown className="h-4 w-4 text-rose-500" />
          <CardTitle className="text-base font-semibold">
            Distribución de etapas por tipo de cáncer
          </CardTitle>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Para cada tipo de cáncer, qué porcentaje de pacientes está en cada etapa al momento del
          diagnóstico. Cada fila suma 100%. Celdas más oscuras = mayor concentración.
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
                <th className="text-center p-2 text-xs uppercase tracking-wide text-rose-600 font-bold border-l-2 border-rose-200 pl-3">
                  % Avanzado<br /><span className="font-normal text-slate-500 normal-case text-[10px]">III + IV</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {cancerTypes.map((cancer) => {
                const advancedTotal = data
                  .filter((d) => d.cancerType === cancer && (d.stage === "Stage III" || d.stage === "Stage IV"))
                  .reduce((s, d) => s + d.pct, 0);
                return (
                  <tr key={cancer}>
                    <td className="text-sm font-semibold text-slate-900 pr-3 whitespace-nowrap">
                      {cancer}
                    </td>
                    {stages.map((stage) => {
                      const cell = lookup.get(`${cancer}|${stage}`);
                      if (!cell) {
                        return (
                          <td key={stage} className="rounded-md bg-slate-100 text-slate-400 text-center text-xs h-14">
                            —
                          </td>
                        );
                      }
                      const isHovered = hovered?.cancerType === cell.cancerType && hovered?.stage === cell.stage;
                      const bg = pctColor(cell.pct, maxPct);
                      const useLight = cell.pct / maxPct > 0.5;
                      return (
                        <td
                          key={stage}
                          onMouseEnter={() => setHovered(cell)}
                          onMouseLeave={() => setHovered(null)}
                          className={`rounded-md text-center font-bold cursor-pointer h-14 transition-all ${
                            isHovered ? "scale-105 shadow-lg" : ""
                          }`}
                          style={{
                            background: bg,
                            color: useLight ? "#fff" : "#1B2A4E",
                            minWidth: 80,
                          }}
                        >
                          <div className="text-base leading-none">{cell.pct.toFixed(1)}%</div>
                          <div className="text-[10px] font-normal opacity-80 mt-1">
                            n={cell.count.toLocaleString()}
                          </div>
                        </td>
                      );
                    })}
                    <td
                      className="text-center font-bold text-sm border-l-2 border-rose-200 pl-3"
                      style={{ color: advancedTotal > 40 ? "#dc2626" : "#1B2A4E" }}
                    >
                      {advancedTotal.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Detalle bajo hover + leyenda */}
        <div className="flex items-center justify-between mt-4 text-xs">
          <div className="text-slate-500">
            {hovered ? (
              <span>
                <span className="font-semibold text-slate-900">
                  {hovered.cancerType} · {hovered.stage}
                </span>
                : <span className="font-semibold">{hovered.pct.toFixed(2)}%</span> de los pacientes
                de este cáncer ({hovered.count.toLocaleString()} casos)
              </span>
            ) : (
              "Pasa el cursor sobre una celda para ver el detalle"
            )}
          </div>
          <div className="flex items-center gap-2 text-slate-600 flex-shrink-0">
            <span>0%</span>
            <div className="h-3 w-28 rounded" style={{ background: "linear-gradient(to right, #F8F7FF, #5C4DFF)" }} />
            <span>{maxPct.toFixed(0)}%</span>
          </div>
        </div>

        {/* Panel de hallazgo automático */}
        <div
          className={`mt-4 p-3 rounded-lg text-xs border ${
            isUniform
              ? "bg-amber-50 border-amber-200 text-amber-900"
              : "bg-emerald-50 border-emerald-200 text-emerald-900"
          }`}
        >
          <div className="font-bold mb-1">
            {isUniform ? "⚠ Hallazgo importante" : "🎯 Patrón detectado"}
          </div>
          <div className="leading-relaxed">
            {isUniform ? (
              <>
                La distribución de etapas es prácticamente uniforme entre todos los tipos de cáncer
                — todos rondan el <span className="font-bold">{maxAdvanced.pct.toFixed(0)}%</span> en
                etapas avanzadas (III + IV). En datos clínicos reales, esperaríamos ver diferencias
                marcadas: por ejemplo, cáncer de páncreas o pulmón suelen diagnosticarse tarde, mientras
                que cervical o mama se detectan más temprano gracias a programas de tamizaje.{" "}
                <span className="italic">La uniformidad observada sugiere que este dataset es sintético.</span>
              </>
            ) : (
              <>
                <span className="font-bold">{maxAdvanced.cancerType}</span> es el tipo de cáncer que
                más se diagnostica tarde ({maxAdvanced.pct.toFixed(1)}% en etapas III+IV), mientras
                que <span className="font-bold">{minAdvanced.cancerType}</span> es el que más temprano
                se detecta ({minAdvanced.pct.toFixed(1)}%). Diferencia de{" "}
                <span className="font-bold">{advancedRange.toFixed(1)} puntos porcentuales</span>.
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
