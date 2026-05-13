import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CancerTypeStats } from "@/lib/data";

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

export function CancerTypeTable({ data }: { data: CancerTypeStats[] }) {
  const maxCases = Math.max(...data.map((d) => d.cases));

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Detalle por tipo de cáncer</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-y border-slate-200 bg-slate-50">
                <th className="text-left py-3 px-5 font-semibold text-slate-600 text-xs uppercase tracking-wide">Tipo</th>
                <th className="text-right py-3 px-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">Casos</th>
                <th className="text-left py-3 px-3 font-semibold text-slate-600 text-xs uppercase tracking-wide w-1/4">% del total</th>
                <th className="text-right py-3 px-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">Edad prom.</th>
                <th className="text-right py-3 px-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">Supervivencia</th>
                <th className="text-right py-3 px-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">Costo prom.</th>
                <th className="text-right py-3 px-5 font-semibold text-slate-600 text-xs uppercase tracking-wide">% Etapa III+IV</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => {
                const color = CANCER_COLORS[row.cancerType] ?? "#6B7280";
                const barPct = (row.cases / maxCases) * 100;
                return (
                  <tr key={row.cancerType} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                        <span className="font-medium text-slate-900">{row.cancerType}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-semibold text-slate-900 tabular-nums">
                      {row.cases.toLocaleString()}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${barPct}%`, background: color }}
                          />
                        </div>
                        <span className="text-xs text-slate-600 tabular-nums w-12 text-right">
                          {row.pct.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right text-slate-700 tabular-nums">
                      {row.avgAge.toFixed(1)}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-700 tabular-nums">
                      {row.avgSurvival.toFixed(1)} años
                    </td>
                    <td className="py-3 px-3 text-right text-slate-700 tabular-nums">
                      ${row.avgCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </td>
                    <td className="py-3 px-5 text-right">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-semibold tabular-nums ${
                          row.pctMaligno > 50
                            ? "bg-rose-50 text-rose-700"
                            : row.pctMaligno > 30
                              ? "bg-amber-50 text-amber-700"
                              : "bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        {row.pctMaligno.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
