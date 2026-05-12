"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
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
  data: { name: string; value: number }[];
}

export function CancerTypeBar({ data }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Tipos de cáncer más frecuentes</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13 }}
              cursor={{ fill: "rgba(92, 77, 255, 0.05)" }}
            />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {data.map((entry) => (
                <Cell key={entry.name} fill={CANCER_COLORS[entry.name] ?? "#6B7280"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
