"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from "recharts";
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
  // Calcula min y max para ajustar la escala
  const values = data.map((d) => d.value);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min;
  // Domain ajustado: empieza un 90% por debajo del mínimo, termina un poco arriba del máximo
  const yMin = Math.floor((min - range * 0.5) / 100) * 100;
  const yMax = Math.ceil((max + range * 0.3) / 100) * 100;

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Tipos de cáncer más frecuentes</CardTitle>
        <p className="text-xs text-slate-500 mt-1">
          Casos absolutos por tipo. La diferencia entre el más y menos frecuente es de apenas{" "}
          <span className="font-semibold text-slate-700">
            {((range / max) * 100).toFixed(1)}%
          </span>
          .
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={data} margin={{ top: 30, right: 10, bottom: 0, left: 0 }}>
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis
              tick={{ fontSize: 12 }}
              domain={[yMin, yMax]}
              tickFormatter={(v: number) => v.toLocaleString()}
            />
            <Tooltip
              contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13 }}
              cursor={{ fill: "rgba(92, 77, 255, 0.05)" }}
              formatter={(value: number) => [value.toLocaleString(), "Casos"]}
            />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {data.map((entry) => (
                <Cell key={entry.name} fill={CANCER_COLORS[entry.name] ?? "#6B7280"} />
              ))}
              <LabelList
                dataKey="value"
                position="top"
                fontSize={11}
                fontWeight={600}
                fill="#334155"
                formatter={(value: number) => value.toLocaleString()}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <p className="text-[11px] text-slate-400 mt-2 text-center italic">
          Escala del eje Y ajustada al rango observado para hacer visibles las diferencias.
        </p>
      </CardContent>
    </Card>
  );
}
