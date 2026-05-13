import { computeMetrics, statsByCancerType } from "@/lib/data";
import { getPageData } from "@/lib/getPageData";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Activity, Calendar, DollarSign, AlertTriangle } from "lucide-react";
import { DashboardShell } from "@/components/DashboardShell";
import { PageHeader } from "@/components/PageHeader";
import { CancerTypeTable } from "@/components/charts/CancerTypeTable";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function Home({ searchParams }: PageProps) {
  const { patients, options, totalCount, filteredCount, isEmpty } = await getPageData(searchParams);

  return (
    <DashboardShell options={options} totalCount={totalCount} filteredCount={filteredCount}>
      <PageHeader
        eyebrow="Sección 01"
        title="Resumen general"
        description="Cifras clave y desglose detallado del conjunto de pacientes filtrados."
      />

      {isEmpty ? (
        <EmptyState />
      ) : (
        <div className="space-y-6">
          <MetricsRow patients={patients} />
          <CancerTypeTable data={statsByCancerType(patients)} />
        </div>
      )}
    </DashboardShell>
  );
}

function MetricsRow({ patients }: { patients: Parameters<typeof computeMetrics>[0] }) {
  const m = computeMetrics(patients);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <MetricCard title="Total pacientes" value={m.total.toLocaleString()} icon={<Users className="h-5 w-5" />} color="#5C4DFF" />
      <MetricCard title="Cáncer más frecuente" value={m.cancerComun} icon={<Activity className="h-5 w-5" />} color="#FF6B6B" />
      <MetricCard title="Supervivencia promedio" value={`${m.avgSurvival.toFixed(1)} años`} icon={<Calendar className="h-5 w-5" />} color="#22C1A2" />
      <MetricCard title="Costo promedio" value={`$${m.avgCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} icon={<DollarSign className="h-5 w-5" />} color="#4A90E2" />
      <MetricCard title="Severidad promedio" value={m.avgSeverity.toFixed(2)} icon={<AlertTriangle className="h-5 w-5" />} color="#FF9F40" />
    </div>
  );
}

function MetricCard({
  title, value, icon, color,
}: { title: string; value: string; icon: React.ReactNode; color: string }) {
  return (
    <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${color}1A`, color }}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs text-slate-500 font-medium uppercase tracking-wide truncate">{title}</div>
          <div className="text-xl font-bold text-slate-900 mt-0.5 truncate">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
    <Card className="p-12 text-center text-slate-500 border-0 shadow-sm">
      <AlertTriangle className="h-10 w-10 mx-auto mb-3 text-amber-400" />
      <h2 className="text-lg font-semibold text-slate-700 mb-1">
        No hay datos con los filtros seleccionados
      </h2>
      <p className="text-sm">Ajusta los filtros del sidebar para ver el dashboard.</p>
    </Card>
  );
}
