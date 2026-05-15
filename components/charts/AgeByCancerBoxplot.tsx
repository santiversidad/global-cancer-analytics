"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import type { BoxStats } from "@/lib/data";

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
  data: BoxStats[];
}

export function AgeByCancerBoxplot({ data }: Props) {
  const [hovered, setHovered] = useState<BoxStats | null>(null);

  const yMin = Math.floor(Math.min(...data.map((d) => d.min)) / 5) * 5;
  const yMax = Math.ceil(Math.max(...data.map((d) => d.max)) / 5) * 5;

  const W = 700;
  const H = 360;
  const pad = { top: 20, right: 20, bottom: 60, left: 50 };
  const plotW = W - pad.left - pad.right;
  const plotH = H - pad.top - pad.bottom;

  const xPos = (i: number) => pad.left + (i + 0.5) * (plotW / data.length);
  const yPos = (v: number) =>
    pad.top + plotH - ((v - yMin) / (yMax - yMin || 1)) * plotH;
  const boxW = (plotW / data.length) * 0.5;

  const ticks = 6;
  const tickValues = Array.from(
    { length: ticks },
    (_, i) => yMin + (i * (yMax - yMin)) / (ticks - 1)
  );

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-indigo-600" />
          <CardTitle className="text-base font-semibold">Edad de diagnóstico por tipo de cáncer</CardTitle>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Distribución estadística (mín, Q1, mediana, Q3, máx) de la edad al diagnóstico.
          Revela qué cánceres afectan poblaciones más jóvenes o mayores.
        </p>
      </CardHeader>

      <CardContent>
        <div className="relative">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
            {tickValues.map((t) => (
              <g key={t}>
                <line
                  x1={pad.left}
                  x2={W - pad.right}
                  y1={yPos(t)}
                  y2={yPos(t)}
                  stroke="#e2e8f0"
                  strokeDasharray="3 3"
                />
                <text x={pad.left - 10} y={yPos(t)} dy="0.32em" textAnchor="end" fontSize="11" fill="#64748b">
                  {Math.round(t)}
                </text>
              </g>
            ))}

            <text
              x={15}
              y={H / 2}
              transform={`rotate(-90, 15, ${H / 2})`}
              textAnchor="middle"
              fontSize="11"
              fill="#64748b"
            >
              Edad (años)
            </text>

            {data.map((d, i) => {
              const x = xPos(i);
              const color = CANCER_COLORS[d.stage] ?? "#6B7280";
              const isHovered = hovered?.stage === d.stage;

              return (
                <g
                  key={d.stage}
                  onMouseEnter={() => setHovered(d)}
                  onMouseLeave={() => setHovered(null)}
                  style={{ cursor: "pointer" }}
                >
                  <line x1={x} x2={x} y1={yPos(d.max)} y2={yPos(d.q3)} stroke={color} strokeWidth={2} />
                  <line x1={x} x2={x} y1={yPos(d.q1)} y2={yPos(d.min)} stroke={color} strokeWidth={2} />
                  <line
                    x1={x - boxW / 4} x2={x + boxW / 4}
                    y1={yPos(d.max)} y2={yPos(d.max)}
                    stroke={color} strokeWidth={2}
                  />
                  <line
                    x1={x - boxW / 4} x2={x + boxW / 4}
                    y1={yPos(d.min)} y2={yPos(d.min)}
                    stroke={color} strokeWidth={2}
                  />
                  <rect
                    x={x - boxW / 2}
                    y={yPos(d.q3)}
                    width={boxW}
                    height={yPos(d.q1) - yPos(d.q3)}
                    fill={color}
                    fillOpacity={isHovered ? 0.6 : 0.4}
                    stroke={color}
                    strokeWidth={2}
                    rx={4}
                    style={{ transition: "fill-opacity 0.2s" }}
                  />
                  <line
                    x1={x - boxW / 2}
                    x2={x + boxW / 2}
                    y1={yPos(d.median)}
                    y2={yPos(d.median)}
                    stroke={color}
                    strokeWidth={3}
                  />
                  <text
                    x={x}
                    y={yPos(d.median) - 6}
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="700"
                    fill="#1B2A4E"
                  >
                    {d.median.toFixed(0)}
                  </text>

                  <text x={x} y={H - pad.bottom + 18} textAnchor="middle" fontSize="11" fill="#334155" fontWeight="500">
                    {d.stage}
                  </text>
                </g>
              );
            })}
          </svg>

          {hovered && (
            <div className="absolute top-2 right-2 bg-white border border-slate-200 rounded-lg shadow-md p-3 text-xs space-y-1 min-w-[180px] pointer-events-none">
              <div className="font-bold text-slate-900 mb-1 flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm" style={{ background: CANCER_COLORS[hovered.stage] }} />
                {hovered.stage}
              </div>
              <Row label="Máx" value={`${hovered.max.toFixed(0)} años`} />
              <Row label="Q3 (75%)" value={`${hovered.q3.toFixed(1)} años`} />
              <Row label="Mediana" value={`${hovered.median.toFixed(1)} años`} bold />
              <Row label="Q1 (25%)" value={`${hovered.q1.toFixed(1)} años`} />
              <Row label="Mín" value={`${hovered.min.toFixed(0)} años`} />
              <div className="border-t border-slate-200 pt-1 mt-1">
                <Row label="Pacientes" value={hovered.count.toLocaleString()} />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-slate-500">{label}</span>
      <span className={`text-slate-900 ${bold ? "font-bold" : "font-medium"}`}>{value}</span>
    </div>
  );
}
