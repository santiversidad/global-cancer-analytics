"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { STAGE_COLORS } from "./StageDonut";
import type { BoxStats } from "@/lib/data";

const STAGE_ORDER = ["Stage 0", "Stage I", "Stage II", "Stage III", "Stage IV"];

interface Props {
  data: BoxStats[];
}

export function SurvivalBoxplot({ data }: Props) {
  const [hovered, setHovered] = useState<BoxStats | null>(null);

  // Ordena por etapa
  const sorted = STAGE_ORDER
    .map((s) => data.find((d) => d.stage === s))
    .filter((d): d is BoxStats => !!d);

  // Dominio del eje Y
  const yMin = Math.floor(Math.min(...sorted.map((d) => d.min)));
  const yMax = Math.ceil(Math.max(...sorted.map((d) => d.max)));

  // Dimensiones SVG (viewBox responsive)
  const W = 600;
  const H = 320;
  const pad = { top: 20, right: 20, bottom: 50, left: 60 };
  const plotW = W - pad.left - pad.right;
  const plotH = H - pad.top - pad.bottom;

  const xPos = (i: number) => pad.left + (i + 0.5) * (plotW / sorted.length);
  const yPos = (v: number) =>
    pad.top + plotH - ((v - yMin) / (yMax - yMin || 1)) * plotH;
  const boxW = (plotW / sorted.length) * 0.45;

  // Ticks del eje Y
  const ticks = 6;
  const tickValues = Array.from(
    { length: ticks },
    (_, i) => yMin + (i * (yMax - yMin)) / (ticks - 1)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          Supervivencia por etapa
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
            {/* Grid horizontal + etiquetas eje Y */}
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
                <text
                  x={pad.left - 10}
                  y={yPos(t)}
                  dy="0.32em"
                  textAnchor="end"
                  fontSize="11"
                  fill="#64748b"
                >
                  {t.toFixed(1)}
                </text>
              </g>
            ))}

            {/* Etiqueta vertical del eje Y */}
            <text
              x={18}
              y={H / 2}
              transform={`rotate(-90, 18, ${H / 2})`}
              textAnchor="middle"
              fontSize="11"
              fill="#64748b"
            >
              Años de supervivencia
            </text>

            {/* Cajas */}
            {sorted.map((d, i) => {
              const x = xPos(i);
              const color = STAGE_COLORS[d.stage] ?? "#6B7280";
              const isHovered = hovered?.stage === d.stage;

              return (
                <g
                  key={d.stage}
                  onMouseEnter={() => setHovered(d)}
                  onMouseLeave={() => setHovered(null)}
                  style={{ cursor: "pointer" }}
                >
                  {/* Bigote superior */}
                  <line x1={x} x2={x} y1={yPos(d.max)} y2={yPos(d.q3)} stroke={color} strokeWidth={2} />
                  {/* Bigote inferior */}
                  <line x1={x} x2={x} y1={yPos(d.q1)} y2={yPos(d.min)} stroke={color} strokeWidth={2} />
                  {/* Topes superior e inferior */}
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
                  {/* Caja Q1–Q3 */}
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
                  {/* Línea de la mediana */}
                  <line
                    x1={x - boxW / 2}
                    x2={x + boxW / 2}
                    y1={yPos(d.median)}
                    y2={yPos(d.median)}
                    stroke={color}
                    strokeWidth={3}
                  />

                  {/* Etiqueta de la etapa */}
                  <text
                    x={x}
                    y={H - pad.bottom + 18}
                    textAnchor="middle"
                    fontSize="12"
                    fill="#334155"
                    fontWeight="500"
                  >
                    {d.stage}
                  </text>
                  <text
                    x={x}
                    y={H - pad.bottom + 33}
                    textAnchor="middle"
                    fontSize="10"
                    fill="#94a3b8"
                  >
                    n={d.count.toLocaleString()}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Tooltip flotante */}
          {hovered && (
            <div className="absolute top-2 right-2 bg-white border border-slate-200 rounded-lg shadow-md p-3 text-xs space-y-1 min-w-[180px] pointer-events-none">
              <div className="font-bold text-slate-900 mb-1 flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-sm"
                  style={{ background: STAGE_COLORS[hovered.stage] }}
                />
                {hovered.stage}
              </div>
              <Row label="Máximo" value={`${hovered.max.toFixed(1)} años`} />
              <Row label="Q3 (75%)" value={`${hovered.q3.toFixed(1)} años`} />
              <Row label="Mediana" value={`${hovered.median.toFixed(1)} años`} bold />
              <Row label="Q1 (25%)" value={`${hovered.q1.toFixed(1)} años`} />
              <Row label="Mínimo" value={`${hovered.min.toFixed(1)} años`} />
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
