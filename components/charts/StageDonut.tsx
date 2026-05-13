"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const STAGE_COLORS: Record<string, string> = {
  "Stage 0":   "#22C1A2",
  "Stage I":   "#4A90E2",
  "Stage II":  "#5C4DFF",
  "Stage III": "#FF9F40",
  "Stage IV":  "#FF6B6B",
};

const STAGE_ORDER = ["Stage 0", "Stage I", "Stage II", "Stage III", "Stage IV"];

// Label que se renderiza DENTRO de cada porción
function renderInnerLabel(props: {
  cx: number; cy: number;
  midAngle: number; innerRadius: number; outerRadius: number;
  percent?: number;
}) {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent = 0 } = props;
  const RAD = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RAD);
  const y = cy + radius * Math.sin(-midAngle * RAD);
  return (
    <text
      x={x}
      y={y}
      fill="#ffffff"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={12}
      fontWeight={700}
      style={{ pointerEvents: "none" }}
    >
      {(percent * 100).toFixed(1)}%
    </text>
  );
}

interface Props {
  data: { name: string; value: number }[];
}

export function StageDonut({ data }: Props) {
  // Ordena de Stage 0 a IV
  const sorted = [...data].sort(
    (a, b) => STAGE_ORDER.indexOf(a.name) - STAGE_ORDER.indexOf(b.name)
  );

  const total = sorted.reduce((sum, d) => sum + d.value, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Distribución por etapa</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={sorted}
                dataKey="value"
                nameKey="name"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={2}
                stroke="#fff"
                strokeWidth={2}
                label={renderInnerLabel}
                labelLine={false}
              >
                {sorted.map((entry) => (
                  <Cell key={entry.name} fill={STAGE_COLORS[entry.name] ?? "#6B7280"} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13 }}
                formatter={(value: number) => [`${value.toLocaleString()} pacientes`, ""]}
              />
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Texto central de la dona */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none -mt-7">
            <div className="text-3xl font-bold text-slate-900">
              {total.toLocaleString()}
            </div>
            <div className="text-xs text-slate-500 uppercase tracking-wide font-semibold">
              Total
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
