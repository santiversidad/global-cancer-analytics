"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  data: Array<Record<string, number | string>>;
}

export function YearlyTrend({ data }: Props) {
  const cancerTypes = Object.keys(data[0] ?? {}).filter((k) => k !== "year");

  // Calcula min/max de todos los valores para ajustar el eje Y
  const allValues: number[] = [];
  for (const row of data) {
    for (const type of cancerTypes) {
      const v = row[type];
      if (typeof v === "number") allValues.push(v);
    }
  }
  const max = Math.max(...allValues);
  const min = Math.min(...allValues);
  const range = max - min;
  const yMin = Math.floor((min - range * 0.3) / 10) * 10;
  const yMax = Math.ceil((max + range * 0.2) / 10) * 10;

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Tendencia de casos por año</CardTitle>
        <p className="text-xs text-slate-500 mt-1">
          Evolución anual de cada tipo de cáncer entre {data[0]?.year ?? ""} y {data[data.length - 1]?.year ?? ""}.
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="year" tick={{ fontSize: 12 }} />
            <YAxis
              domain={[yMin, yMax]}
              tick={{ fontSize: 12 }}
              tickFormatter={(v: number) => v.toLocaleString()}
            />
            <Tooltip
              contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13 }}
              formatter={(value: number) => value.toLocaleString()}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" />
            {cancerTypes.map((type) => (
              <Line
                key={type}
                type="monotone"
                dataKey={type}
                stroke={CANCER_COLORS[type] ?? "#6B7280"}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
        <p className="text-[11px] text-slate-400 mt-2 text-center italic">
          Eje Y ajustado al rango observado para visualizar las variaciones anuales.
        </p>
      </CardContent>
    </Card>
  );
}
