"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid, LabelList } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import type { GenderCancerRow } from "@/lib/data";

const GENDER_COLORS = {
  Female: "#FF6B6B",
  Male:   "#4A90E2",
  Other:  "#B19CD9",
};

interface Props {
  data: GenderCancerRow[];
}

export function GenderCancerBar({ data }: Props) {
  // Convertir a porcentajes para que el stack sume 100%
  const pctData = data.map((d) => ({
    cancerType: d.cancerType,
    "Female": (d.Female / d.total) * 100,
    "Male":   (d.Male   / d.total) * 100,
    "Other":  (d.Other  / d.total) * 100,
    total: d.total,
  }));

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-indigo-600" />
          <CardTitle className="text-base font-semibold">Distribución por género en cada tipo de cáncer</CardTitle>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Porcentaje de pacientes hombres, mujeres y otros por tipo de cáncer.
          Revela restricciones biológicas como cervical (100% mujeres) o próstata (100% hombres).
        </p>
      </CardHeader>

      <CardContent>
        <ResponsiveContainer width="100%" height={340}>
          <BarChart
            data={pctData}
            layout="vertical"
            margin={{ top: 10, right: 30, bottom: 0, left: 20 }}
            stackOffset="expand"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
            <XAxis
              type="number"
              domain={[0, 100]}
              tickFormatter={(v: number) => `${v}%`}
              tick={{ fontSize: 11 }}
            />
            <YAxis
              type="category"
              dataKey="cancerType"
              tick={{ fontSize: 12, fontWeight: 500 }}
              width={75}
            />
            <Tooltip
              contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13 }}
              formatter={(value: number, name: string) => [`${value.toFixed(1)}%`, name]}
            />
            <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="Female" stackId="a" fill={GENDER_COLORS.Female}>
              <LabelList
                dataKey="Female"
                position="insideRight"
                fill="#fff"
                fontSize={10}
                fontWeight={600}
                formatter={(v: number) => (v > 8 ? `${v.toFixed(0)}%` : "")}
              />
            </Bar>
            <Bar dataKey="Male" stackId="a" fill={GENDER_COLORS.Male}>
              <LabelList
                dataKey="Male"
                position="insideRight"
                fill="#fff"
                fontSize={10}
                fontWeight={600}
                formatter={(v: number) => (v > 8 ? `${v.toFixed(0)}%` : "")}
              />
            </Bar>
            <Bar dataKey="Other" stackId="a" fill={GENDER_COLORS.Other}>
              <LabelList
                dataKey="Other"
                position="insideRight"
                fill="#fff"
                fontSize={10}
                fontWeight={600}
                formatter={(v: number) => (v > 8 ? `${v.toFixed(0)}%` : "")}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
