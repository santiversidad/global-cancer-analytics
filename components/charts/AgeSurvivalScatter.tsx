"use client";

import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { STAGE_COLORS } from "./StageDonut";
import type { ScatterPoint } from "@/lib/data";

const STAGE_ORDER = ["Stage 0", "Stage I", "Stage II", "Stage III", "Stage IV"];

interface Props {
  data: ScatterPoint[];
}

export function AgeSurvivalScatter({ data }: Props) {
  // Agrupa por etapa para que cada Scatter tenga su color
  const byStage: Record<string, ScatterPoint[]> = {};
  for (const p of data) {
    if (!byStage[p.stage]) byStage[p.stage] = [];
    byStage[p.stage].push(p);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Edad vs Supervivencia (por etapa)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <ScatterChart margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              type="number"
              dataKey="age"
              name="Edad"
              tick={{ fontSize: 12 }}
              label={{ value: "Edad", position: "insideBottom", offset: -5, fontSize: 12 }}
            />
            <YAxis
              type="number"
              dataKey="survival"
              name="Supervivencia"
              tick={{ fontSize: 12 }}
              label={{ value: "Años de supervivencia", angle: -90, position: "insideLeft", fontSize: 12 }}
            />
            <ZAxis range={[30, 30]} />
            <Tooltip
              cursor={{ strokeDasharray: "3 3" }}
              contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13 }}
              formatter={(value: number, name: string) => {
                if (name === "Edad") return [`${value} años`, "Edad"];
                if (name === "Supervivencia") return [`${value.toFixed(1)} años`, "Supervivencia"];
                return [value, name];
              }}
            />
            <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
            {STAGE_ORDER.filter((stage) => byStage[stage]).map((stage) => (
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
      </CardContent>
    </Card>
  );
}
