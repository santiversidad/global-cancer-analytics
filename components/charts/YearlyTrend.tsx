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
  // Extrae los tipos de cáncer (todas las claves excepto "year")
  const cancerTypes = Object.keys(data[0] ?? {}).filter((k) => k !== "year");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Tendencia de casos por año</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="year" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13 }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {cancerTypes.map((type) => (
              <Line
                key={type}
                type="monotone"
                dataKey={type}
                stroke={CANCER_COLORS[type] ?? "#6B7280"}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
