"use client";

import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown } from "lucide-react";
import { STAGE_COLORS } from "./StageDonut";
import type { ScatterPoint } from "@/lib/data";

const STAGE_ORDER = ["Stage 0", "Stage I", "Stage II", "Stage III", "Stage IV"];

interface Props {
  data: ScatterPoint[];
}

// Coeficiente de correlación rápido para mostrar al usuario
function pearson(points: ScatterPoint[]): number {
  const n = points.length;
  if (n === 0) return 0;
  let sx = 0, sy = 0;
  for (const p of points) { sx += p.severity; sy += p.survival; }
  const mx = sx / n;
  const my = sy / n;
  let cov = 0, vx = 0, vy = 0;
  for (const p of points) {
    const dx = p.severity - mx;
    const dy = p.survival - my;
    cov += dx * dy;
    vx += dx * dx;
    vy += dy * dy;
  }
  const denom = Math.sqrt(vx * vy);
  return denom === 0 ? 0 : cov / denom;
}

export function SeveritySurvivalScatter({ data }: Props) {
  const corr = pearson(data);

  // Agrupa por etapa para asignar colores
  const byStage: Record<string, ScatterPoint[]> = {};
  for (const p of data) {
    if (!byStage[p.stage]) byStage[p.stage] = [];
    byStage[p.stage].push(p);
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-2">
          <TrendingDown className="h-4 w-4 text-rose-500" />
          <CardTitle className="text-base font-semibold">
            Severidad vs Supervivencia
          </CardTitle>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Cada punto es un paciente. La relación negativa indica que a mayor severidad,
          menor supervivencia. <span className="font-semibold">Correlación de Pearson: {corr.toFixed(3)}</span>{" "}
          ({describeCorr(corr)}).
        </p>
      </CardHeader>

      <CardContent>
        <ResponsiveContainer width="100%" height={360}>
          <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              type="number"
              dataKey="severity"
              name="Severidad"
              domain={[0, 10]}
              tick={{ fontSize: 12 }}
              label={{ value: "Severidad (0–10)", position: "insideBottom", offset: -5, fontSize: 12 }}
            />
            <YAxis
              type="number"
              dataKey="survival"
              name="Supervivencia"
              domain={[0, 10]}
              tick={{ fontSize: 12 }}
              label={{ value: "Años de supervivencia", angle: -90, position: "insideLeft", fontSize: 12 }}
            />
            <ZAxis range={[28, 28]} />
            <Tooltip
              cursor={{ strokeDasharray: "3 3" }}
              contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13 }}
              formatter={(value: number, name: string) => {
                if (name === "Severidad") return [value.toFixed(2), "Severidad"];
                if (name === "Supervivencia") return [`${value.toFixed(1)} años`, "Supervivencia"];
                return [value, name];
              }}
            />
            <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
            {STAGE_ORDER.filter((s) => byStage[s]).map((stage) => (
              <Scatter
                key={stage}
                name={stage}
                data={byStage[stage]}
                fill={STAGE_COLORS[stage]}
                fillOpacity={0.55}
              />
            ))}
          </ScatterChart>
        </ResponsiveContainer>

        <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-900">
          <div className="font-bold mb-1">💡 Hallazgo</div>
          <div className="leading-relaxed">
            La nube de puntos forma un patrón diagonal descendente: los pacientes de menor severidad
            (Stage 0–I, en verde-azul) se concentran arriba (alta supervivencia), mientras los de
            severidad alta (Stage III–IV, en naranja-rojo) caen al cuadrante inferior derecho.{" "}
            <strong>Esto confirma que la severidad es un predictor fuerte de mortalidad</strong>.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function describeCorr(v: number): string {
  const abs = Math.abs(v);
  const dir = v > 0 ? "positiva" : "negativa";
  if (abs < 0.1) return "prácticamente nula";
  if (abs < 0.3) return `débil ${dir}`;
  if (abs < 0.6) return `moderada ${dir}`;
  if (abs < 0.8) return `fuerte ${dir}`;
  return `muy fuerte ${dir}`;
}
