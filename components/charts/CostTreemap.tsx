"use client";

import { useState } from "react";
import { Treemap, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign } from "lucide-react";
import type { TreemapNode } from "@/lib/data";

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

// Opacidad creciente según etapa (más oscuro = etapa avanzada)
const STAGE_OPACITY: Record<string, number> = {
  "Stage 0":   0.45,
  "Stage I":   0.60,
  "Stage II":  0.75,
  "Stage III": 0.90,
  "Stage IV":  1.0,
};

interface Props {
  data: TreemapNode[];
}

// Renderizado custom de cada celda
function CustomCell(props: {
  x: number; y: number; width: number; height: number;
  name?: string;
  cancerType?: string;
  cases?: number;
  size?: number;
  depth?: number;
  root?: { children?: TreemapNode[] };
}) {
  const { x, y, width, height, name, cancerType, cases, size, depth } = props;

  if (depth === 0) return null;

  // Si es nivel de cáncer (padre), solo borde sutil
  if (depth === 1 && !cancerType) {
    return (
      <g>
        <rect x={x} y={y} width={width} height={height} fill="transparent"
          stroke="#fff" strokeWidth={3} />
      </g>
    );
  }

  const baseColor = CANCER_COLORS[cancerType ?? ""] ?? "#6B7280";
  const opacity = STAGE_OPACITY[name ?? ""] ?? 0.7;

  // Solo mostrar texto si la celda es lo suficientemente grande
  const showLabel = width > 60 && height > 40;
  const showStage = width > 40 && height > 25;
  const showValue = width > 80 && height > 55;

  return (
    <g>
      <rect
        x={x} y={y} width={width} height={height}
        fill={baseColor}
        fillOpacity={opacity}
        stroke="#fff"
        strokeWidth={2}
      />
      {showStage && (
        <text
          x={x + 6} y={y + 16}
          fontSize={11}
          fontWeight={700}
          fill="#fff"
          style={{ textShadow: "0 1px 2px rgba(0,0,0,0.4)" }}
        >
          {name}
        </text>
      )}
      {showLabel && cancerType && (
        <text
          x={x + 6} y={y + 30}
          fontSize={10}
          fontWeight={500}
          fill="#fff"
          fillOpacity={0.9}
          style={{ textShadow: "0 1px 2px rgba(0,0,0,0.4)" }}
        >
          {cancerType}
        </text>
      )}
      {showValue && size && (
        <text
          x={x + 6} y={y + height - 8}
          fontSize={10}
          fontWeight={600}
          fill="#fff"
          fillOpacity={0.95}
          style={{ textShadow: "0 1px 2px rgba(0,0,0,0.4)" }}
        >
          ${(size / 1_000_000).toFixed(1)}M
        </text>
      )}
    </g>
  );
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: TreemapNode }> }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  if (!d.cancerType) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-md p-3 text-xs">
      <div className="font-bold text-slate-900 mb-1">
        {d.cancerType} · {d.name}
      </div>
      <div className="space-y-0.5 text-slate-600">
        <div>💰 Costo total: <span className="font-semibold text-slate-900">${((d.size || 0) / 1_000_000).toFixed(2)}M</span></div>
        <div>👥 Pacientes: <span className="font-semibold">{d.cases?.toLocaleString()}</span></div>
        <div>📊 Costo promedio: <span className="font-semibold">${d.avgCost?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span></div>
      </div>
    </div>
  );
}

export function CostTreemap({ data }: Props) {
  // Total global para % en insight
  const totalCost = data.reduce((s, d) => s + (d.size || 0), 0);
  const topCancer = data[0];
  const topCancerPct = topCancer ? ((topCancer.size || 0) / totalCost) * 100 : 0;

  // Top 3 celdas más caras (combinaciones cáncer × etapa)
  const allCells: Array<{ cancer: string; stage: string; cost: number; pct: number }> = [];
  for (const d of data) {
    for (const c of d.children ?? []) {
      allCells.push({
        cancer: d.name,
        stage: c.name,
        cost: c.size || 0,
        pct: ((c.size || 0) / totalCost) * 100,
      });
    }
  }
  allCells.sort((a, b) => b.cost - a.cost);
  const top3 = allCells.slice(0, 3);

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-emerald-600" />
          <CardTitle className="text-base font-semibold">
            ¿Dónde se concentra el gasto sanitario?
          </CardTitle>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Tamaño = costo total acumulado. Color = tipo de cáncer. Opacidad = etapa (más oscuro = más avanzada).
        </p>
      </CardHeader>

      <CardContent>
        <ResponsiveContainer width="100%" height={420}>
          <Treemap
            data={data}
            dataKey="size"
            aspectRatio={4 / 3}
            content={<CustomCell />}
            stroke="#fff"
          >
            <Tooltip content={<CustomTooltip />} />
          </Treemap>
        </ResponsiveContainer>

        {/* Panel de insights automáticos */}
        <div className="mt-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
          <div className="font-bold mb-1.5">💡 Hallazgos económicos</div>
          <ul className="space-y-1 leading-relaxed">
            <li>
              <strong>{topCancer.name}</strong> concentra el{" "}
              <strong>{topCancerPct.toFixed(1)}%</strong> del gasto total
              (${((topCancer.size || 0) / 1_000_000).toFixed(1)}M de ${(totalCost / 1_000_000).toFixed(1)}M).
            </li>
            <li>
              Las 3 combinaciones más costosas son:{" "}
              {top3.map((c, i) => (
                <span key={i}>
                  <strong>{c.cancer} {c.stage}</strong> ({c.pct.toFixed(1)}%)
                  {i < top3.length - 1 && ", "}
                </span>
              ))}.
            </li>
            <li>
              Las etapas avanzadas (III + IV) son significativamente más costosas que las
              tempranas — invertir en detección temprana reduce el costo total del sistema.
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
