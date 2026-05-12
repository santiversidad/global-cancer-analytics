import { loadPatients, computeMetrics, countByCategory, countByYearAndType, statsByCountry, getScatterPoints } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Activity, Calendar, DollarSign, AlertTriangle } from "lucide-react";
import { CancerTypeBar } from "@/components/charts/CancerTypeBar";
import { YearlyTrend } from "@/components/charts/YearlyTrend";
import { WorldMap } from "@/components/charts/WorldMap";
import { StageDonut } from "@/components/charts/StageDonut";
import { AgeSurvivalScatter } from "@/components/charts/AgeSurvivalScatter";

export default function Home() {
  // ⬇️ Esto corre en el servidor — el navegador NUNCA ve este código
  const patients = loadPatients();
  const metrics = computeMetrics(patients);
  const cancerTypeData = countByCategory(patients, "Cancer_Type");
  const yearlyTrendData = countByYearAndType(patients);
  const countryData = statsByCountry(patients);
  const stageData = countByCategory(patients, "Cancer_Stage");
  const scatterData = getScatterPoints(patients);

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">

        {/* Encabezado con gradiente */}
        <div className="rounded-xl p-8 mb-8 text-white shadow-lg"
             style={{ background: "linear-gradient(135deg, #1B2A4E 0%, #5C4DFF 100%)" }}>
          <h1 className="text-3xl font-bold">Dashboard de Cáncer Global</h1>
          <p className="text-slate-200 mt-1">
            Análisis exploratorio de pacientes con cáncer a nivel mundial · 2015 – 2024
          </p>
        </div>

        {/* Tarjetas de métricas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <MetricCard
            title="Total pacientes"
            value={metrics.total.toLocaleString()}
            icon={<Users className="h-5 w-5" />}
            color="#5C4DFF"
          />
          <MetricCard
            title="Cáncer más frecuente"
            value={metrics.cancerComun}
            icon={<Activity className="h-5 w-5" />}
            color="#FF6B6B"
          />
          <MetricCard
            title="Supervivencia promedio"
            value={`${metrics.avgSurvival.toFixed(1)} años`}
            icon={<Calendar className="h-5 w-5" />}
            color="#22C1A2"
          />
          <MetricCard
            title="Costo promedio"
            value={`$${metrics.avgCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
            icon={<DollarSign className="h-5 w-5" />}
            color="#4A90E2"
          />
          <MetricCard
            title="Severidad promedio"
            value={metrics.avgSeverity.toFixed(2)}
            icon={<AlertTriangle className="h-5 w-5" />}
            color="#FF9F40"
          />
        </div>

        {/* Mapa mundial */}
        <div className="mt-6">
          <WorldMap data={countryData} />
        </div>

        {/* Sección de gráficas — fila 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
          <CancerTypeBar data={cancerTypeData} />
          <YearlyTrend data={yearlyTrendData} />
        </div>

        {/* Sección de gráficas — fila 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
          <StageDonut data={stageData} />
          <AgeSurvivalScatter data={scatterData} />
        </div>

      </div>
    </main>
  );
}

// Componente reutilizable para cada tarjeta
function MetricCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <Card className="border-l-4" style={{ borderLeftColor: color }}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-600">{title}</CardTitle>
        <div style={{ color }}>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-slate-900">{value}</div>
      </CardContent>
    </Card>
  );
}
